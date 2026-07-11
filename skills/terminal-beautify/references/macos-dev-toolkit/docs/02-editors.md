# macOS — 编辑器安装

---

## Helix

> [Helix](https://helix-editor.com) 一款 Rust 编写的模态编辑器，内置 LSP、Tree-sitter。命令名称为 `hx`。

### 安装

**方法 A：Homebrew（推荐）**
```bash
brew install helix
```

**方法 B：cargo 安装**
```bash
cargo install helix-term --locked
```

### 验证
```bash
hx --version
```

### 配置

`~/.config/helix/config.toml`：
```toml
theme = "catppuccin_mocha"
[editor]
line-number = "relative"
cursor-shape = { normal = "block", insert = "bar", select = "underline" }
```

`~/.config/helix/languages.toml`：
```toml
[language-server.rust-analyzer]
command = "rust-analyzer"
[[language]]
name = "rust"
file-types = ["rs"]
roots = ["Cargo.toml"]
auto-format = true
language-servers = ["rust-analyzer"]
```

### 快捷键参考
```bash
hx .              # 文件树
hx file.rs        # 打开文件
# Esc: :q 退出  :w 保存  gg 文件头  G 文件尾  v 选择
# Space+f 文件树  Space+b 缓冲区  Tab 切换
```

---

## Zed

> [Zed](https://zed.dev) 一款 Rust 编写的高性能代码编辑器，支持 AI 辅助协作编辑。

### 安装

**方法 A：Homebrew（推荐）**
```bash
brew install --cask zed
```

**方法 B：curl 安装**
```bash
curl -f https://zed.dev/install.sh | sh
```

### 启动
```bash
zed .        # 打开项目
zed file.rs  # 打开文件
```

### 配置

`~/.config/zed/settings.json`：
```json
{
  "theme": "Catppuccin Mocha",
  "telemetry": { "diagnostics": false, "metrics": false },
  "ui_font_size": 14,
  "buffer_font_size": 14,
  "autosave": "on_window_change",
  "tab_size": 4,
  "soft_tabs": true
}
```

### LSP 支持
```bash
rustup component add rust-analyzer
npm install -g typescript typescript-language-server
pip install pyright
go install golang.org/x/tools/gopls@latest
```

### 快捷键
| 操作 | macOS 快捷键 |
|------|-------------|
| 命令面板 | `Cmd+Shift+P` |
| 文件搜索 | `Cmd+P` |
| 项目搜索 | `Cmd+Shift+F` |
| 切换终端 | `Ctrl+\`` |
| 保存 | `Cmd+S` |
| 关闭标签 | `Cmd+W` |
