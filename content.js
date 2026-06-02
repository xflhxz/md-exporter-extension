/**
 * Page to Markdown - Content Script
 *
 * Converts the current page's HTML into clean, well-formatted Markdown.
 * Supports: headings, paragraphs, lists, tables, code blocks, math (KaTeX/MathJax),
 *           bold/italic, links, images, blockquotes, YAML front matter.
 */

(() => {
  if (window.__mdExporterInjected) return;
  window.__mdExporterInjected = true;

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === 'export_markdown') {
      sendResponse(buildMarkdownDocument(msg.options || {}));
      return true;
    }
    if (msg.action === 'ping') {
      sendResponse({ ok: true });
      return true;
    }
  });

  // ─────────────────────────────────────────────
  //  Known programming language names
  //  Used to detect and suppress language-label elements in code block headers
  // ─────────────────────────────────────────────

  const LANG_NAMES = new Set([
    'abap','ada','apex','applescript','arduino','asm','assembly',
    'bash','bat','batch','c','c++','clojure','cmake','cobol','coffeescript',
    'cpp','crystal','csharp','css','dart','diff','dockerfile','elixir',
    'elm','erlang','fsharp','go','gradle','graphql','groovy','haskell',
    'html','http','ini','java','javascript','jinja','js','json','jsx',
    'julia','kotlin','latex','less','lisp','lua','makefile','markdown',
    'matlab','md','mermaid','nginx','nim','nix','objc','ocaml','pascal',
    'perl','php','plaintext','plsql','powershell','protobuf','python',
    'r','rails','regex','ruby','rust','sass','scala','scheme','scss',
    'sh','shell','smalltalk','sql','swift','tcl','text','toml','ts',
    'tsx','typescript','vb','verilog','vhdl','vim','vue','wasm','xml',
    'yaml','zig',
  ]);

  // ─────────────────────────────────────────────
  //  Main entry point
  // ─────────────────────────────────────────────

  function buildMarkdownDocument(options) {
    const {
      includeFrontMatter = true,
      includeImages = true,
      includeLinks = true,
      selectionOnly = false,
      locale = 'en',
    } = options;

    const meta = extractMeta();
    let content;

    if (selectionOnly) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const div = document.createElement('div');
        for (let i = 0; i < sel.rangeCount; i++) {
          div.appendChild(sel.getRangeAt(i).cloneContents());
        }
        content = domToMarkdown(div, { includeImages, includeLinks });
      } else {
        content = '';
      }
    } else {
      const mainEl = findMainContent();
      content = domToMarkdown(mainEl, { includeImages, includeLinks });
    }

    content = content
      .replace(/\n{4,}/g, '\n\n\n')
      .replace(/[ \t]+$/gm, '')
      .trim();

    const truncatedMsg = locale === 'zh-CN'
      ? '\n\n> *内容过长，已在此截断。*'
      : '\n\n> *Content too long, truncated here.*';
    if (content.length > 200000) {
      content = content.substring(0, 200000) + truncatedMsg;
    }

    let markdown = '';
    if (includeFrontMatter) {
      markdown = buildFrontMatter(meta) + '\n\n';
    }
    markdown += content;

    const filename = safeFilename(document.title) + '.md';
    return { markdown, filename, charCount: content.length };
  }

  // ─────────────────────────────────────────────
  //  YAML Front Matter
  // ─────────────────────────────────────────────

  function buildFrontMatter(meta) {
    const esc = (s) => (s || '').replace(/"/g, '\\"');
    const lines = ['---'];
    lines.push(`title: "${esc(document.title)}"`);
    lines.push(`url: "${window.location.href}"`);
    lines.push(`exported_at: "${new Date().toISOString()}"`);
    if (meta.author)      lines.push(`author: "${esc(meta.author)}"`);
    if (meta.description) lines.push(`description: "${esc(meta.description)}"`);
    if (meta.siteName)    lines.push(`site: "${esc(meta.siteName)}"`);
    if (meta.publishDate) lines.push(`published: "${meta.publishDate}"`);
    if (meta.language)    lines.push(`lang: ${meta.language}`);
    if (meta.keywords) {
      const tags = meta.keywords.split(',').map(k => `"${k.trim()}"`).join(', ');
      lines.push(`tags: [${tags}]`);
    }
    lines.push('---');
    return lines.join('\n');
  }

  // ─────────────────────────────────────────────
  //  Meta extraction
  // ─────────────────────────────────────────────

  function extractMeta() {
    const get = (name, attr = 'name') =>
      document.querySelector(`meta[${attr}="${name}"]`)?.content || null;

    return {
      description: get('description') || get('og:description', 'property'),
      keywords:    get('keywords'),
      author:      get('author') || get('article:author', 'property'),
      publishDate: get('article:published_time', 'property') || get('date'),
      siteName:    get('og:site_name', 'property'),
      language:    document.documentElement.lang || null,
    };
  }

  // ─────────────────────────────────────────────
  //  Main content detection
  // ─────────────────────────────────────────────

  function findMainContent() {
    // Chat / conversation pages — prioritize message containers
    const chatSelectors = [
      '[class*="conversation-content"]', '[class*="message-list"]',
      '[class*="chat-messages"]', '[class*="messages-container"]',
      '[class*="chat-content"]', '[class*="conversation-body"]',
      '[class*="thread-content"]', '[class*="chat-body"]',
    ];
    for (const sel of chatSelectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText.trim().length > 100) return el;
    }

    // Standard article/content selectors
    const candidates = [
      'article[role="main"]', 'main article', 'article',
      '[role="main"]', 'main',
      '.post-content', '.article-content', '.article-body',
      '.entry-content', '.markdown-body', '#readme',
      '.prose', '.story-body', '.content-body', '.post-body',
      '#article-body', '#content', '.content',
    ];
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el && el.innerText.trim().length > 200) return el;
    }

    // Fallback: body minus navigation/headers/footers/inputs
    const clone = document.body.cloneNode(true);
    ['nav', 'header', 'footer', '.sidebar', '.menu', 'aside',
     'script', 'style', 'noscript', 'textarea', 'form'].forEach(sel => {
      try { clone.querySelectorAll(sel).forEach(el => el.remove()); } catch (e) {}
    });
    return clone;
  }

  // ─────────────────────────────────────────────
  //  DOM → Markdown converter
  // ─────────────────────────────────────────────

  const NOISE_SELECTORS = [
    'script', 'style', 'noscript', 'iframe',
    'nav', '.nav', '.navigation', '.menu', '.sidebar',
    '.ad', '.ads', '.advertisement', '[class*="ad-"]',
    '.social-share', '.share-buttons', '.comments', '#comments',
    '.related-posts', '.recommended', '.cookie-banner',
    '.popup', '.modal', '.overlay', '.toc', '.table-of-contents',
    // Chat UI input / toolbar areas
    'textarea', '[role="textbox"]', '[contenteditable="true"]',
    '[role="toolbar"]', 'form',
    '[class*="chat-input"]', '[class*="message-input"]', '[class*="input-area"]',
    '[class*="input-box"]', '[class*="compose"]',
    // Generic noise
    'svg',
  ];

  function domToMarkdown(rootEl, opts) {
    const clone = rootEl.cloneNode(true);
    NOISE_SELECTORS.forEach(sel => {
      try { clone.querySelectorAll(sel).forEach(el => el.remove()); } catch (e) {}
    });

    const parts = [];
    walkNode(clone, parts, 0, opts);
    return parts.join('');
  }

  // ─────────────────────────────────────────────
  //  Code block detection helpers
  // ─────────────────────────────────────────────

  /**
   * Detect if a child element is a "code block header" —
   * a small sibling element (language label + copy button) that precedes a code/pre.
   * These should be suppressed from text output.
   */
  function isCodeBlockHeader(el, parent) {
    if (el.nodeType !== Node.ELEMENT_NODE) return false;
    const tag = el.tagName.toLowerCase();
    // Buttons inside code blocks (copy button) should always be skipped
    if (tag === 'button') return true;

    const siblings = Array.from(parent.children);
    const idx = siblings.indexOf(el);
    if (idx === -1) return false;

    // Is there a code/pre sibling after this element?
    const afterSiblings = siblings.slice(idx + 1);
    const hasCodeSibling = afterSiblings.some(s =>
      s.tagName === 'PRE' || s.tagName === 'CODE'
    );
    if (!hasCodeSibling) return false;

    // Element should be "small" — just a label + maybe a button
    const text = el.textContent.trim();
    // Max ~20 chars for language name + "Copy code" type labels
    return text.length < 40 && !text.includes('\n');
  }

  /**
   * Multi-source language detection for a code element.
   */
  function getCodeLanguage(codeEl) {
    // 1. From class: language-java, lang-java, hljs language-java, etc.
    const classes = (codeEl.className || '').split(/\s+/);
    const fromLangClass = classes.find(c => c.startsWith('language-'))?.replace('language-', '') ||
                          classes.find(c => c.startsWith('lang-'))?.replace('lang-', '');
    if (fromLangClass) return fromLangClass;

    // 2. From data attributes on the element itself or its parent
    const fromData = codeEl.getAttribute('data-lang') ||
                     codeEl.getAttribute('data-language') ||
                     codeEl.parentElement?.getAttribute('data-lang') ||
                     codeEl.parentElement?.getAttribute('data-language') ||
                     codeEl.parentElement?.getAttribute('class')?.match(/\blanguage-(\w+)/)?.[1];
    if (fromData) return fromData;

    // 3. hljs non-prefixed class (e.g., class="hljs java")
    const hljsLang = classes.find(c => c !== 'hljs' && LANG_NAMES.has(c.toLowerCase()));
    if (hljsLang) return hljsLang.toLowerCase();

    // 4. Previous sibling that looks like a language label
    const prevLang = findLanguageLabelBefore(codeEl);
    if (prevLang) return prevLang;

    // 5. Inside parent: look for a lang label in parent's previous sibling
    const parentEl = codeEl.parentElement; // e.g., <pre>
    if (parentEl) {
      const parentPrev = findLanguageLabelBefore(parentEl);
      if (parentPrev) return parentPrev;
    }

    return '';
  }

  /**
   * Walk backwards through previous siblings looking for a language label element.
   */
  function findLanguageLabelBefore(el) {
    let prev = el.previousElementSibling;
    while (prev) {
      const text = prev.textContent.trim().toLowerCase();
      if (LANG_NAMES.has(text)) return text;
      // Check children for a language span
      const inner = prev.querySelector('[class*="lang"], [class*="language"], span, div');
      if (inner) {
        const innerText = inner.textContent.trim().toLowerCase();
        if (LANG_NAMES.has(innerText)) return innerText;
      }
      prev = prev.previousElementSibling;
    }
    return '';
  }

  // ─────────────────────────────────────────────
  //  Main node walker
  // ─────────────────────────────────────────────

  function walkNode(node, parts, depth, opts) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent.replace(/\s+/g, ' ');
      if (t.trim()) parts.push(t);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = node.tagName.toLowerCase();

    // Skip invisible elements
    try {
      const st = window.getComputedStyle?.(node);
      if (st && (st.display === 'none' || st.visibility === 'hidden')) return;
    } catch (e) {}

    // Skip buttons unconditionally (copy buttons, UI controls)
    if (tag === 'button') return;

    // ── Math ──────────────────────────────────
    if (handleMath(node, tag, parts)) return;

    // ── Block elements ─────────────────────────
    switch (tag) {
      case 'h1': parts.push('\n\n# ' + innerText(node) + '\n\n'); return;
      case 'h2': parts.push('\n\n## ' + innerText(node) + '\n\n'); return;
      case 'h3': parts.push('\n\n### ' + innerText(node) + '\n\n'); return;
      case 'h4': parts.push('\n\n#### ' + innerText(node) + '\n\n'); return;
      case 'h5': case 'h6':
        parts.push('\n\n##### ' + innerText(node) + '\n\n'); return;

      case 'p':
        parts.push('\n\n');
        walkChildren(node, parts, depth, opts);
        parts.push('\n');
        return;

      case 'br':  parts.push('\n'); return;
      case 'hr':  parts.push('\n\n---\n\n'); return;

      case 'blockquote': {
        const bqParts = [];
        walkChildren(node, bqParts, depth, opts);
        const qt = bqParts.join('').trim();
        parts.push('\n\n' + qt.split('\n').map(l => '> ' + l).join('\n') + '\n\n');
        return;
      }

      case 'pre': {
        const codeEl = node.querySelector('code');
        const lang = getCodeLanguage(codeEl || node);
        const code = (codeEl || node).textContent;
        parts.push('\n\n```' + lang + '\n' + code + '\n```\n\n');
        return;
      }

      case 'ul': case 'ol': {
        parts.push('\n');
        node.querySelectorAll(':scope > li').forEach((li, i) => {
          const bullet = tag === 'ol' ? `${i + 1}. ` : '- ';
          const indent = '  '.repeat(depth);
          parts.push(indent + bullet);
          const liParts = [];
          walkChildren(li, liParts, depth + 1, opts);
          parts.push(liParts.join('').replace(/^\n+/, '').trimEnd());
          parts.push('\n');
        });
        parts.push('\n');
        return;
      }

      case 'table': {
        parts.push('\n\n');
        const rows = node.querySelectorAll('tr');
        rows.forEach((row, ri) => {
          const cells = Array.from(row.querySelectorAll('th, td'))
            .map(c => innerText(c).replace(/\|/g, '\\|').replace(/\n/g, ' ').trim());
          if (cells.length === 0) return;
          parts.push('| ' + cells.join(' | ') + ' |\n');
          if (ri === 0) parts.push('| ' + cells.map(() => '---').join(' | ') + ' |\n');
        });
        parts.push('\n');
        return;
      }

      case 'details': {
        const summary = node.querySelector('summary');
        if (summary) {
          parts.push('\n\n**' + innerText(summary) + '**\n');
          for (const child of node.childNodes) {
            if (child !== summary) walkNode(child, parts, depth, opts);
          }
        } else {
          walkChildren(node, parts, depth, opts);
        }
        return;
      }

      case 'figure': {
        walkChildren(node, parts, depth, opts);
        const cap = node.querySelector('figcaption');
        if (cap) parts.push('\n*' + innerText(cap) + '*\n');
        return;
      }

      // ── Inline elements ──────────────────────

      case 'code': {
        const parentTag = node.parentElement?.tagName.toLowerCase();
        if (parentTag === 'pre') break; // handled by pre case

        const text = node.textContent || '';
        if (text.includes('\n') || text.length > 80) {
          // Treat as a fenced code block
          const lang = getCodeLanguage(node);
          parts.push('\n\n```' + lang + '\n' + text + '\n```\n\n');
        } else {
          parts.push('`' + text + '`');
        }
        return;
      }

      case 'a': {
        const href = node.getAttribute('href');
        const text = innerText(node).trim();
        if (!text) { walkChildren(node, parts, depth, opts); return; }
        if (opts.includeLinks && href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          try {
            parts.push(`[${text}](${new URL(href, window.location.href).href})`);
          } catch (e) { parts.push(text); }
        } else {
          parts.push(text);
        }
        return;
      }

      case 'img': {
        if (!opts.includeImages) return;
        const alt = node.getAttribute('alt')?.trim() || '';
        const src = node.getAttribute('src');
        // Skip tiny images (icons, avatars) based on width/height attributes
        const w = parseInt(node.getAttribute('width') || '0');
        const h = parseInt(node.getAttribute('height') || '0');
        if ((w > 0 && w <= 32) || (h > 0 && h <= 32)) return;
        if (!src) { if (alt) parts.push(`[图片: ${alt}]`); return; }
        try {
          parts.push(`![${alt}](${new URL(src, window.location.href).href})`);
        } catch (e) {
          parts.push(`![${alt}](${src})`);
        }
        return;
      }

      case 'strong': case 'b':
        parts.push('**'); walkChildren(node, parts, depth, opts); parts.push('**'); return;
      case 'em': case 'i':
        parts.push('*'); walkChildren(node, parts, depth, opts); parts.push('*'); return;
      case 'del': case 's':
        parts.push('~~'); walkChildren(node, parts, depth, opts); parts.push('~~'); return;
      case 'mark':
        parts.push('=='); walkChildren(node, parts, depth, opts); parts.push('=='); return;
      case 'sup':
        parts.push('^'); walkChildren(node, parts, depth, opts); parts.push('^'); return;
      case 'sub':
        parts.push('~'); walkChildren(node, parts, depth, opts); parts.push('~'); return;
    }

    walkChildren(node, parts, depth, opts);
  }

  function walkChildren(node, parts, depth, opts) {
    for (const child of node.childNodes) {
      // Suppress code block header elements (language labels, copy buttons)
      if (isCodeBlockHeader(child, node)) continue;
      walkNode(child, parts, depth, opts);
    }
  }

  function innerText(node) {
    return (node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  // ─────────────────────────────────────────────
  //  Math formula handling
  // ─────────────────────────────────────────────

  function handleMath(node, tag, parts) {
    // KaTeX
    if (node.classList?.contains('katex') || node.classList?.contains('katex-display')) {
      const ann = node.querySelector('annotation[encoding="application/x-tex"]');
      if (ann) {
        const isBlock = node.classList.contains('katex-display') ||
                        node.parentElement?.classList.contains('katex-display');
        parts.push(isBlock ? `\n\n$$\n${ann.textContent.trim()}\n$$\n\n` : `$${ann.textContent.trim()}$`);
        return true;
      }
    }

    // MathJax v3
    if (tag === 'mjx-container') {
      const math = node.querySelector('math');
      const alttext = math?.getAttribute('alttext') || node.getAttribute('data-formula');
      const ann = node.querySelector('annotation[encoding="application/x-tex"]');
      const latex = alttext || ann?.textContent.trim();
      if (latex) {
        const isBlock = node.getAttribute('display') === 'block' ||
                        node.classList.contains('MathJax_Display');
        parts.push(isBlock ? `\n\n$$\n${latex}\n$$\n\n` : `$${latex}$`);
        return true;
      }
    }

    // MathJax v2 script
    if (tag === 'script' && node.type?.startsWith('math/tex')) {
      const latex = node.textContent.trim();
      const isBlock = node.type.includes('mode=display');
      parts.push(isBlock ? `\n\n$$\n${latex}\n$$\n\n` : `$${latex}$`);
      return true;
    }

    // MathJax v2 rendered (skip — source is in script sibling)
    if (node.classList?.contains('MathJax') || node.classList?.contains('MathJax_Display') ||
        node.classList?.contains('MathJax_Preview')) {
      return true;
    }

    // Native MathML
    if (tag === 'math') {
      const alt = node.getAttribute('alttext');
      const ann = node.querySelector('annotation[encoding="application/x-tex"]');
      const latex = alt || ann?.textContent.trim();
      if (latex) {
        const isBlock = node.getAttribute('display') === 'block';
        parts.push(isBlock ? `\n\n$$\n${latex}\n$$\n\n` : `$${latex}$`);
        return true;
      }
    }

    return false;
  }

  // ─────────────────────────────────────────────
  //  Helpers
  // ─────────────────────────────────────────────

  function safeFilename(title) {
    return (title || 'page')
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 80) || 'page';
  }
})();
