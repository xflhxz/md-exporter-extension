(() => {
  // ── Locale ──

  const LOCALE_KEY = 'preferred_locale';
  const LOCALE_EN = 'en';
  const LOCALE_ZH = 'zh-CN';

  const messages = {
    en: {
      appSubtitle: 'Export any webpage to Markdown',
      pageTitle: 'Export Markdown',
      scopeLabel: 'Scope',
      scopeFullPage: 'Full Page',
      scopeSelection: 'Selection',
      optionsLabel: 'Options',
      optionFrontMatter: 'YAML Front Matter',
      optionImages: 'Include Images',
      optionLinks: 'Include Links',
      exportBtn: 'Export Markdown',
      shortcutHint: 'Shortcut: Alt+Shift+M · Right-click menu supported',
      statusExtracting: 'Extracting page content…',
      statusGenerating: 'Generating file…',
      statusExported: '✓ Exported: {filename}',
      statusExportFailed: 'Export failed: {error}',
      errorNoTab: 'Unable to get current tab',
      errorNoContent: 'No content could be extracted',
      charCount: '{count} chars',
      charCountK: '{count}k chars',
      langToggle: '中文',
    },
    'zh-CN': {
      appSubtitle: '将网页导出为 Markdown 文件',
      pageTitle: '导出 Markdown',
      scopeLabel: '导出范围',
      scopeFullPage: '整页内容',
      scopeSelection: '选中内容',
      optionsLabel: '导出选项',
      optionFrontMatter: 'YAML 元数据',
      optionImages: '保留图片链接',
      optionLinks: '保留超链接',
      exportBtn: '导出 Markdown',
      shortcutHint: '快捷键：Alt+Shift+M · 支持右键菜单',
      statusExtracting: '正在提取页面内容…',
      statusGenerating: '正在生成文件…',
      statusExported: '✓ 已导出：{filename}',
      statusExportFailed: '导出失败：{error}',
      errorNoTab: '无法获取当前标签页',
      errorNoContent: '未能提取到任何内容',
      charCount: '{count} 字符',
      charCountK: '{count}k 字符',
      langToggle: 'English',
    },
  };

  function msg(key, locale, replacements) {
    let text = (messages[locale] || messages.en)[key] || messages.en[key] || '';
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, v);
      }
    }
    return text;
  }

  // ── State ──

  let currentScope = 'page';
  let locale = LOCALE_EN;

  async function init() {
    // Read stored locale preference
    const stored = await chrome.storage.local.get(LOCALE_KEY);
    const uiLang = chrome.i18n.getUILanguage();
    locale = stored[LOCALE_KEY] || (uiLang.startsWith('zh') ? LOCALE_ZH : LOCALE_EN);

    applyLocale();
    restoreOptions();
    bindEvents();
  }

  function applyLocale() {
    document.title = msg('pageTitle', locale);
    document.getElementById('appSubtitle').textContent = msg('appSubtitle', locale);
    document.getElementById('scopeLabel').textContent = msg('scopeLabel', locale);
    document.getElementById('scopeFullPage').textContent = msg('scopeFullPage', locale);
    document.getElementById('scopeSelection').textContent = msg('scopeSelection', locale);
    document.getElementById('optionsLabel').textContent = msg('optionsLabel', locale);
    document.getElementById('optionFrontMatter').textContent = msg('optionFrontMatter', locale);
    document.getElementById('optionImages').textContent = msg('optionImages', locale);
    document.getElementById('optionLinks').textContent = msg('optionLinks', locale);
    document.getElementById('btnText').textContent = msg('exportBtn', locale);
    document.getElementById('shortcutHint').textContent = msg('shortcutHint', locale);
    document.getElementById('langToggle').textContent = msg('langToggle', locale);
  }

  async function switchLocale() {
    locale = locale === LOCALE_EN ? LOCALE_ZH : LOCALE_EN;
    await chrome.storage.local.set({ [LOCALE_KEY]: locale });
    applyLocale();
    // Recreate context menus with new language
    try {
      await chrome.runtime.sendMessage({ action: 'recreate_menus' });
    } catch (e) {
      // Service worker may not be ready
    }
  }

  // ── Options ──

  async function restoreOptions() {
    const { frontMatter, images, links } = await chrome.storage.local.get({
      frontMatter: true, images: true, links: true,
    });
    document.getElementById('optFrontMatter').checked = frontMatter;
    document.getElementById('optImages').checked = images;
    document.getElementById('optLinks').checked = links;
  }

  // ── Events ──

  function bindEvents() {
    document.getElementById('langToggle').addEventListener('click', switchLocale);

    document.getElementById('scopeTabs').addEventListener('click', (e) => {
      const tab = e.target.closest('[data-scope]');
      if (!tab) return;
      currentScope = tab.dataset.scope;
      document.querySelectorAll('.scope-tab').forEach(t =>
        t.classList.toggle('active', t === tab)
      );
    });

    document.getElementById('exportBtn').addEventListener('click', runExport);
  }

  // ── Export ──

  async function runExport() {
    const btn = document.getElementById('exportBtn');
    btn.disabled = true;
    setStatus('loading', msg('statusExtracting', locale));
    hideStats();

    const options = {
      includeFrontMatter: document.getElementById('optFrontMatter').checked,
      includeImages: document.getElementById('optImages').checked,
      includeLinks: document.getElementById('optLinks').checked,
      selectionOnly: currentScope === 'selection',
      locale,
    };

    chrome.storage.local.set({
      frontMatter: options.includeFrontMatter,
      images: options.includeImages,
      links: options.includeLinks,
    });

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) throw new Error(msg('errorNoTab', locale));

      let result;

      try {
        result = await chrome.tabs.sendMessage(tab.id, { action: 'export_markdown', options });
      } catch (e) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js'],
        });
        await sleep(80);
        result = await chrome.tabs.sendMessage(tab.id, { action: 'export_markdown', options });
      }

      if (!result?.markdown) throw new Error(msg('errorNoContent', locale));

      setStatus('loading', msg('statusGenerating', locale));
      await triggerDownload(tab.id, result.markdown, result.filename);

      setStatus('success', msg('statusExported', locale, { filename: result.filename }));
      showStats(result.charCount, result.filename);
    } catch (err) {
      setStatus('error', msg('statusExportFailed', locale, { error: err.message || String(err) }));
    } finally {
      btn.disabled = false;
    }
  }

  async function triggerDownload(tabId, markdown, filename) {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (md, fn) => {
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fn;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 300);
      },
      args: [markdown, filename],
    });
  }

  // ── UI helpers ──

  function setStatus(type, text) {
    const bar = document.getElementById('statusBar');
    bar.className = 'status-bar ' + type;
    if (type === 'loading') {
      bar.innerHTML = `<span class="spinner"></span><span>${text}</span>`;
    } else {
      bar.textContent = text;
    }
  }

  function showStats(charCount, filename) {
    document.getElementById('statsArea').style.display = 'flex';
    const label = charCount >= 1000
      ? msg('charCountK', locale, { count: (charCount / 1000).toFixed(1) })
      : msg('charCount', locale, { count: charCount });
    document.getElementById('charCount').textContent = label;
    const short = filename.length > 28 ? filename.substring(0, 25) + '…' : filename;
    document.getElementById('filenameChip').textContent = short;
  }

  function hideStats() {
    document.getElementById('statsArea').style.display = 'none';
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ── Boot ──

  init();
})();
