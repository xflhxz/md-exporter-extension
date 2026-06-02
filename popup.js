/**
 * Page to Markdown - Popup Script
 */

(() => {
  // ── State ──────────────────────────────────────────────────────────────────

  let currentScope = 'page'; // 'page' | 'selection'

  // Restore saved options from storage
  chrome.storage.local.get(
    { frontMatter: true, images: true, links: true },
    ({ frontMatter, images, links }) => {
      document.getElementById('optFrontMatter').checked = frontMatter;
      document.getElementById('optImages').checked = images;
      document.getElementById('optLinks').checked = links;
    }
  );

  // ── Scope tabs ─────────────────────────────────────────────────────────────

  document.getElementById('scopeTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('[data-scope]');
    if (!tab) return;
    currentScope = tab.dataset.scope;
    document.querySelectorAll('.scope-tab').forEach(t =>
      t.classList.toggle('active', t === tab)
    );
  });

  // ── Export ─────────────────────────────────────────────────────────────────

  document.getElementById('exportBtn').addEventListener('click', runExport);

  async function runExport() {
    const btn = document.getElementById('exportBtn');
    btn.disabled = true;
    setStatus('loading', '正在提取页面内容…');
    hideStats();

    const options = {
      includeFrontMatter: document.getElementById('optFrontMatter').checked,
      includeImages: document.getElementById('optImages').checked,
      includeLinks: document.getElementById('optLinks').checked,
      selectionOnly: currentScope === 'selection',
    };

    // Persist options
    chrome.storage.local.set({
      frontMatter: options.includeFrontMatter,
      images: options.includeImages,
      links: options.includeLinks,
    });

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) throw new Error('无法获取当前标签页');

      let result;

      // Try via content script first (already injected)
      try {
        result = await chrome.tabs.sendMessage(tab.id, {
          action: 'export_markdown',
          options,
        });
      } catch (e) {
        // Content script not yet injected — inject it then retry
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js'],
        });
        // Small wait for script to register its listener
        await sleep(80);
        result = await chrome.tabs.sendMessage(tab.id, {
          action: 'export_markdown',
          options,
        });
      }

      if (!result?.markdown) throw new Error('未能提取到任何内容');

      setStatus('loading', '正在生成文件…');
      await triggerDownload(tab.id, result.markdown, result.filename);

      setStatus('success', `✓ 已导出：${result.filename}`);
      showStats(result.charCount, result.filename);
    } catch (err) {
      setStatus('error', '导出失败：' + (err.message || String(err)));
    } finally {
      btn.disabled = false;
    }
  }

  // ── Download ───────────────────────────────────────────────────────────────

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

  // ── UI helpers ─────────────────────────────────────────────────────────────

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
    document.getElementById('charCount').textContent =
      charCount >= 1000 ? `${(charCount / 1000).toFixed(1)}k 字符` : `${charCount} 字符`;
    // Show truncated filename if too long
    const short = filename.length > 28 ? filename.substring(0, 25) + '…' : filename;
    document.getElementById('filenameChip').textContent = short;
  }

  function hideStats() {
    document.getElementById('statsArea').style.display = 'none';
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
})();
