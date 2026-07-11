# Linux — 编辑器安装

---

## Helix

> [Helix](https://helix-editor.com) 是一款 Rust 编写的模态编辑器，内置 LSP、Tree-sitter 语法高亮。命令名称为 `hx`。

### 安装

**方法 A：cargo 安装（推荐，版本最新）**
```bash
cargo install helix-term --locked
```

**方法 B：snap 安装**
```bash
sudo snap install helix --classic
```

**方法 C：预编译二进制**
```bash
ARCH=$(uname -m)
if [ "$ARCH" = "aarch64" ]; then
    TARGET="helix-$(curl -s https://api.github.com/repos/helix-editor/helix/releases/latest | grep tag_name | cut -d'"' -f4)-aarch64-linux.tar.xz"
else
    TARGET="helix-$(curl -s https://api.github.com/repos/helix-editor/helix/releases/latest | grep tag_name | cut -d'"' -f4)-x86_64-linux.tar.xz"
fi
wget -qO- "https://github.com/helix-editor/helix/releases/latest/download/$TARGET" | tar xJ -C ~/.local/bin --strip-components=1
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

### 快速参考
```bash
hx .         # 打开文件树
hx file.rs   # 打开文件
# Esc 普通模式：:q 退出  :w 保存  gg 文件头  G 文件尾  v 选择
# Space+f 文件树  Space+b 缓冲区  Tab 切换缓冲区
```

---

## Zed

> [Zed](https://zed.dev) 是一款 Rust 编写的高性能代码编辑器，支持 AI 辅助协作编辑。

### 安装
```bash
curl -f https://zed.dev/install.sh | sh
```
安装后二进制在 `~/.local/bin/zed`。

### 启动
```bash
zed .        # 打开当前项目
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

### LSP 语言支持
```bash
# Rust
rustup component add rust-analyzer
# TypeScript / JavaScript
npm install -g typescript typescript-language-server
# Python
pip install pyright
# Go
go install golang.org/x/tools/gopls@latest
```

### 快捷键
| 操作 | Linux 快捷键 |
|------|-------------|
| 命令面板 | `Ctrl+Shift+P` |
| 文件搜索 | `Ctrl+P` |
| 项目搜索 | `Ctrl+Shift+F` |
| 切换终端 | `Ctrl+\`` |
| 保存 | `Ctrl+S` |
| 关闭标签 | `Ctrl+W` |
