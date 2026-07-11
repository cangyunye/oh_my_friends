# macOS 终端工具套件

> 针对 **macOS** 优化（兼容 Intel 和 Apple Silicon）。按需选择安装。

---

## 📦 工具一览

| 工具 | 类别 | 说明 |
|------|------|------|
| **Starship** · **ripgrep** · **fd** · **bat** · **lsd** · **fzf** · **zoxide** · **Nushell** · **Nerd Font** | 🛠️ 核心工具 | 终端美化、搜索、替代工具 |
| **Helix** · **Zed** | 📝 编辑器 | 终端/图形界面代码编辑器 |
| **OpenCode** · **Oh My Pi (omp)** | 🤖 AI 编程 | AI 编程助手与代理 |
| **Copyparty** | 🗂️ 文件共享 | HTTP/WebDAV/FTP 文件服务器 |

## 📖 快速导航

| 用途 | 文档 |
|------|------|
| 安装核心工具（Homebrew/cargo） | [docs/01-core.md](docs/01-core.md) |
| 安装编辑器（Helix / Zed） | [docs/02-editors.md](docs/02-editors.md) |
| 安装 AI 工具（OpenCode / Pi Agent） | [docs/03-ai.md](docs/03-ai.md) |
| 安装文件共享（Copyparty） | [docs/04-file-sharing.md](docs/04-file-sharing.md) |
| 配置模板 + 快速参考 | [docs/05-config.md](docs/05-config.md) |

## 🚀 快速开始

```bash
# 1. 安装核心工具 (Homebrew)
brew install starship ripgrep fd bat lsd fzf zoxide nushell

# 2. 配置 Starship + 别名
# 参见 docs/01-core.md

# 3. （可选）安装编辑器
# 参见 docs/02-editors.md

# 4. （可选）安装 AI 工具
# 参见 docs/03-ai.md

# 5. （可选）安装文件共享
# 参见 docs/04-file-sharing.md
```

## 目录结构

```
macos-dev-toolkit/
├── README.md
├── docs/
│   ├── 01-core.md
│   ├── 02-editors.md
│   ├── 03-ai.md
│   ├── 04-file-sharing.md
│   └── 05-config.md
```
