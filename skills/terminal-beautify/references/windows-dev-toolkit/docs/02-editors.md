# Windows — 编辑器安装

---

## Zed

> [Zed](https://zed.dev) 一款 Rust 编写的高性能代码编辑器，支持 AI 辅助协作编辑。
> Windows 版目前为**预览版**。

### 安装

**方法 A：winget 安装（推荐）**
```powershell
winget install Zed.Zed
```

**方法 B：直接从官网下载 MSI**
```powershell
Invoke-WebRequest -Uri "https://zed.dev/api/download/zed-windows.msi" -OutFile "$env:TEMP\zed.msi"
Start-Process msiexec.exe -Wait -ArgumentList "/i `"$env:TEMP\zed.msi`" /quiet"
```

### 启动
```powershell
zed .
zed file.rs
```

### 配置

`%APPDATA%\Zed\settings.json`：
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
```powershell
rustup component add rust-analyzer
npm install -g typescript typescript-language-server
pip install pyright
go install golang.org/x/tools/gopls@latest
```

### 快捷键
| 操作 | Windows 快捷键 |
|------|---------------|
| 命令面板 | `Ctrl+Shift+P` |
| 文件搜索 | `Ctrl+P` |
| 项目搜索 | `Ctrl+Shift+F` |
| 切换终端 | `Ctrl+\`` |
| 保存 | `Ctrl+S` |
| 关闭标签 | `Ctrl+W` |
