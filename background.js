/**
 * Page to Markdown - Background Service Worker
 *
 * Handles:
 *  - Context menu registration & click
 *  - Keyboard shortcut command
 */

// ── Context menu setup ─────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  // Right-click on page background
  chrome.contextMenus.create({
    id: 'export-page-md',
    title: '导出页面为 Markdown',
    contexts: ['page', 'frame'],
  });

  // Right-click when text is selected
  chrome.contextMenus.create({
    id: 'export-selection-md',
    title: '导出选中内容为 Markdown',
    contexts: ['selection'],
  });
});

// ── Context menu click ─────────────────────────────────────────

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  const selectionOnly = info.menuItemId === 'export-selection-md';
  await exportTab(tab.id, selectionOnly);
});

// ── Keyboard shortcut ──────────────────────────────────────────

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'export-markdown') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  await exportTab(tab.id, false);
});

// ── Core export logic ──────────────────────────────────────────

async function exportTab(tabId, selectionOnly) {
  // Ensure content script is alive
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'ping' });
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
    await sleep(80);
  }

  // Read saved user options
  const opts = await chrome.storage.local.get({
    frontMatter: true,
    images: true,
    links: true,
  });

  let result;
  try {
    result = await chrome.tabs.sendMessage(tabId, {
      action: 'export_markdown',
      options: {
        includeFrontMatter: opts.frontMatter,
        includeImages: opts.images,
        includeLinks: opts.links,
        selectionOnly,
      },
    });
  } catch (e) {
    console.error('[md-exporter] content script error:', e);
    return;
  }

  if (result?.markdown) {
    await triggerDownload(tabId, result.markdown, result.filename);
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
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 300);
    },
    args: [markdown, filename],
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
