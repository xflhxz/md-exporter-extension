<p align="center">
  <img src="icons/icon128.png" alt="Page to Markdown" width="80" height="80">
</p>

<h1 align="center">📄 Page to Markdown</h1>

<p align="center">
  <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-673AB8" alt="Manifest V3">
  <img src="https://img.shields.io/github/license/xflhxz/md-exporter-extension" alt="License">
</p>

---

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
   git clone https://github.com/xflhxz/md-exporter-extension.git
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
git clone https://github.com/xflhxz/md-exporter-extension.git
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
