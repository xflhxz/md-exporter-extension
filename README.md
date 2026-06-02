<p align="center">
  <img src="icons/icon128.png" alt="Page to Markdown" width="80" height="80">
</p>

<h1 align="center">📄 Page to Markdown</h1>

<p align="center">
  <a href="#english">English</a> · <a href="#chinese">中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-673AB8" alt="Manifest V3">
  <img src="https://img.shields.io/github/license/jiajunhuang/md-exporter-extension" alt="License">
</p>

---

<h2 align="center" id="english">🇬🇧 English</h2>

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
   git clone https://github.com/jiajunhuang/md-exporter-extension.git
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
git clone https://github.com/jiajunhuang/md-exporter-extension.git
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

<h2 align="center" id="chinese">🇨🇳 中文</h2>

**Page to Markdown** 是一款强大的 Chrome 扩展，能够将任意网页内容一键转换为格式完整的 Markdown 文件。无论你是开发者、写作者还是研究人员，它都能帮你轻松保存网页内容。

### ✨ 特性

- ✅ **一键导出** — 点击工具栏图标或按 `Alt+Shift+M` 即可导出
- ✅ **右键菜单** — 在页面上右键，选择"导出页面为 Markdown"
- ✅ **选中内容导出** — 只导出你选中的部分，不导出整页
- ✅ **YAML 元数据** — 自动提取标题、URL、作者、发布时间等信息
- ✅ **代码块识别** — 智能识别编程语言，生成带语法标注的代码块
- ✅ **数学公式** — 支持 KaTeX / MathJax 渲染的公式（LaTeX 语法）
- ✅ **表格转换** — 将 HTML 表格转换为 Markdown 表格
- ✅ **图片保留** — 保留原始图片链接
- ✅ **超链接保留** — 保留原始超链接
- ✅ **智能内容提取** — 自动识别正文区域，跳过导航、广告等无关元素
- ✅ **深色主题** — 美观的深色 UI 弹窗

<br>

### 🚀 安装

#### 开发者模式手动安装

1. 下载此仓库到本地：
   ```bash
   git clone https://github.com/jiajunhuang/md-exporter-extension.git
   ```
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启 **"开发者模式"**（右上角）
4. 点击 **"加载已解压的扩展程序"**
5. 选择项目目录即可

<br>

### 🎯 使用方法

#### 方式一：工具栏按钮
点击 Chrome 工具栏中的扩展图标 → 点击 **"导出 Markdown"** 按钮。

#### 方式二：右键菜单
在页面任意位置右键 → 选择 **"导出页面为 Markdown"** 或 **"导出选中内容为 Markdown"**。

#### 方式三：键盘快捷键
按下 `Alt + Shift + M` 即可快速导出当前页面。

#### 导出选项
- **YAML 元数据**：在文件头部包含标题、URL、导出时间等信息
- **保留图片链接**：在 Markdown 中保留图片引用
- **保留超链接**：在 Markdown 中保留超链接
- **导出范围**：选择导出整页内容或仅导出选中内容

<br>

### ⚙️ 技术细节

- **架构**：Manifest V3
- **核心转换**：纯 JavaScript DOM → Markdown 转换器，无外部依赖
- **支持的数学引擎**：KaTeX、MathJax v2/v3、原生 MathML
- **智能内容检测**：支持多种主流博客和文章页面的正文识别
- **文件编码**：UTF-8，生成标准 `.md` 文件

#### 项目结构

```
md-exporter-extension/
├── manifest.json        # 扩展配置（Manifest V3）
├── background.js        # 后台 Service Worker
├── content.js           # 内容脚本（核心转换逻辑）
├── popup.html           # 弹出窗口 UI
├── popup.js             # 弹出窗口逻辑
├── icons/               # 图标资源
└── PRIVACY.md           # 隐私政策
```

<br>

### 🗺️ 路线图

- [x] 核心转换引擎
- [x] 右键菜单支持
- [x] 键盘快捷键
- [x] 数学公式支持（KaTeX、MathJax）
- [ ] 发布到 Chrome Web Store
- [ ] 支持自定义 Markdown 模板
- [ ] 批量导出标签页
- [ ] 更丰富的元数据支持（关键词、分类等）
- [ ] 自定义输出文件名格式
- [ ] 支持 Firefox / Edge

<br>

### 🤝 贡献指南

欢迎贡献代码、提出建议或报告 Bug！

1. Fork 本仓库
2. 创建你的特性分支：`git checkout -b feat/amazing-feature`
3. 提交你的改动：`git commit -m 'feat: add amazing feature'`
4. 推送到分支：`git push origin feat/amazing-feature`
5. 提交 Pull Request

#### 开发指引

```bash
git clone https://github.com/jiajunhuang/md-exporter-extension.git
cd md-exporter-extension
# 在 Chrome 中加载已解压的扩展程序，修改后刷新扩展
```

<br>

### 📄 隐私政策

本扩展 **不会收集任何用户数据**。所有操作均在浏览器本地完成，不会将任何页面内容发送到远程服务器。

详见 [PRIVACY.md](PRIVACY.md)。

<br>

### 📝 开源协议

本项目基于 [MIT License](LICENSE) 开源。

<br>

### ⭐ 支持项目

如果你觉得这个项目有用，请给它一个 Star ⭐ 来表示支持！

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/xflhxz">xflhxz</a>
</p>
