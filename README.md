<p align="center">
  <img src="icons/icon128.png" alt="Page to Markdown" width="80" height="80">
</p>

<h1 align="center">📄 Page to Markdown</h1>

<p align="center">
  <a href="README.zh.md">中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-673AB8" alt="Manifest V3">
  <img src="https://img.shields.io/github/license/xflhxz/md-exporter-extension" alt="License">
</p>

---

**Page to Markdown** is a powerful Chrome extension that converts any webpage into a well-formatted Markdown file with a single click. Perfect for developers, writers, and researchers who want to save web content effortlessly.

### ✨ Features

- ✅ **One-click export** — Click the toolbar icon or press `Alt+Shift+M` to export instantly
- ✅ **Right-click menu** — Right-click on any page and select "Export page as Markdown"
- ✅ **Selection export** — Export only the selected content instead of the full page
- ✅ **YAML front matter** — Automatically extracts title, URL, author, publish date, and more
- ✅ **Code block detection** — Smart language detection with syntax-highlighted code fences
- ✅ **Math formulas** — Supports KaTeX / MathJax rendered formulas (LaTeX syntax)
- ✅ **Table conversion** — Converts HTML tables to clean Markdown tables
- ✅ **Image preservation** — Keeps original image links
- ✅ **Link preservation** — Keeps original hyperlinks
- ✅ **Smart content extraction** — Automatically identifies main content, skips navigation, ads, and clutter
- ✅ **Dark theme** — Sleek dark UI popup

<br>

### 🚀 Installation

#### Manual Install (Developer Mode)

1. Clone the repository:
   ```bash
   git clone https://github.com/xflhxz/md-exporter-extension.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (top-right corner)
4. Click **"Load unpacked"**
5. Select the project directory

<br>

### 🎯 Usage

#### Method 1: Toolbar Button
Click the extension icon in the Chrome toolbar → Click **"Export Markdown"**.

#### Method 2: Right-Click Menu
Right-click anywhere on a page → Select **"Export page as Markdown"** or **"Export selection as Markdown"**.

#### Method 3: Keyboard Shortcut
Press `Alt + Shift + M` to quickly export the current page.

#### Export Options
- **YAML Front Matter**: Include title, URL, export time, etc. at the top of the file
- **Include Images**: Preserve image references in the Markdown output
- **Include Links**: Preserve hyperlinks in the Markdown output
- **Scope**: Export full page content or only selected content

<br>

### ⚙️ Technical Details

- **Architecture**: Manifest V3
- **Core conversion**: Pure JavaScript DOM → Markdown converter, zero external dependencies
- **Math engine support**: KaTeX, MathJax v2/v3, native MathML
- **Content detection**: Supports a wide range of blog and article layouts
- **Encoding**: UTF-8, generates standard `.md` files

#### Project Structure

```
md-exporter-extension/
├── manifest.json        # Extension config (Manifest V3)
├── background.js        # Service Worker
├── content.js           # Content script (core conversion logic)
├── popup.html           # Popup UI
├── popup.js             # Popup logic
├── icons/               # Icon assets
└── PRIVACY.md           # Privacy policy
```

<br>

### 🗺️ Roadmap

- [x] Core conversion engine
- [x] Right-click menu support
- [x] Keyboard shortcut
- [x] Math formula support (KaTeX, MathJax)
- [ ] Publish to Chrome Web Store
- [ ] Custom Markdown templates
- [ ] Batch export tabs
- [ ] Extended metadata (keywords, categories, etc.)
- [ ] Customizable filename format
- [ ] Firefox / Edge support

<br>

### 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

#### Development

```bash
git clone https://github.com/xflhxz/md-exporter-extension.git
cd md-exporter-extension
# Load unpacked extension in Chrome, refresh on changes
```

<br>

### 📄 Privacy Policy

This extension **does NOT collect any user data**. All operations are performed locally in your browser. No page content is ever sent to any remote server.

See [PRIVACY.md](PRIVACY.md) for details.

<br>

### 📝 License

This project is licensed under the [MIT License](LICENSE).

<br>

### ⭐ Support

If you find this project useful, please give it a Star ⭐ on GitHub!

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/xflhxz">xflhxz</a>
</p>
