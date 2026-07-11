# Windows — 核心工具

> 提供 **cargo 编译安装** 和 **GitHub Releases 下载** 两种方式。

---

## 前置条件：安装 Rust 工具链

访问 [https://rustup.rs](https://rustup.rs) 下载 `rustup-init.exe` 并运行。

```powershell
rustc --version
cargo --version
```

> Rust 安装后自动将 `%USERPROFILE%\.cargo\bin` 加入 PATH。

---

## 方案 A：cargo install（从 crates.io 编译安装）

### 镜像加速（国内推荐）

创建 `%USERPROFILE%\.cargo\config.toml`：
```toml
[source.crates-io]
replace-with = 'tuna'
[source.tuna]
registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"
```

### 批量安装
```powershell
cargo install starship ripgrep fd-find nu bat lsd zoxide
```

| 工具 | cargo 包名 | 命令 |
|------|-----------|------|
| Starship | `starship` | `cargo install starship` |
| ripgrep | `ripgrep` | `cargo install ripgrep` |
| fd | `fd-find` | `cargo install fd-find` |
| bat | `bat` | `cargo install bat` |
| lsd | `lsd` | `cargo install lsd` |
| zoxide | `zoxide` | `cargo install zoxide` |
| Nushell | `nu` | `cargo install nu` |

> `fzf` 为 Go 项目，不支持 cargo 安装，请使用下方 GitHub Releases 方式下载。

### 验证
```powershell
starship --version; rg --version; fd --version; bat --version; lsd --version; fzf --version; zoxide --version; nu --version
```

---

## 方案 B：GitHub Releases（下载预编译二进制）

| 工具 | 下载 |
|------|------|
| **Starship** | `starship-x86_64-pc-windows-msvc.zip` |
| **ripgrep** | `ripgrep-x86_64-pc-windows-msvc.zip` |
| **fd** | `fd-x86_64-pc-windows-msvc.zip` |
| **bat** | `bat-x86_64-pc-windows-msvc.zip` |
| **lsd** | `lsd-x86_64-pc-windows-msvc.zip` |
| **fzf** | `fzf-{VERSION}-windows_amd64.zip`（访问 [Releases](https://github.com/junegunn/fzf/releases) 获取最新版本号） |
| **zoxide** | `zoxide-x86_64-pc-windows-msvc.zip` |
| **Nushell** | `nu-x86_64-pc-windows-msvc.zip` |
| **Nerd Font** | `JetBrainsMono.zip` |

### 安装示例
```powershell
mkdir D:\tools\bin -Force

# Starship
Invoke-WebRequest -Uri "https://github.com/starship/starship/releases/latest/download/starship-x86_64-pc-windows-msvc.zip" -OutFile "$env:TEMP\starship.zip"
Expand-Archive -Path "$env:TEMP\starship.zip" -DestinationPath "D:\tools\bin\" -Force

# fzf（官方 Go 版 — 通过 API 获取最新版本号）
$fzfVer = (Invoke-RestMethod "https://api.github.com/repos/junegunn/fzf/releases/latest").tag_name
Invoke-WebRequest -Uri "https://github.com/junegunn/fzf/releases/download/$fzfVer/fzf-$fzfVer-windows_amd64.zip" -OutFile "$env:TEMP\fzf.zip"
Expand-Archive -Path "$env:TEMP\fzf.zip" -DestinationPath "D:\tools\bin\" -Force

# zoxide
Invoke-WebRequest -Uri "https://github.com/ajeetdsouza/zoxide/releases/latest/download/zoxide-x86_64-pc-windows-msvc.zip" -OutFile "$env:TEMP\zoxide.zip"
Expand-Archive -Path "$env:TEMP\zoxide.zip" -DestinationPath "D:\tools\bin\" -Force

# 添加到 PATH
$env:Path += ";D:\tools\bin"
[Environment]::SetEnvironmentVariable("Path", "$env:Path;D:\tools\bin", "User")
```

---

## 配置 Starship（PowerShell + Nushell）

```powershell
mkdir $env:USERPROFILE\.config -Force
starship preset pastel-powerline -o $env:USERPROFILE\.config\starship.toml
```

### PowerShell
编辑 `$PROFILE`：
```powershell
Invoke-Expression (&starship init powershell)
```

### Nushell
编辑 `%APPDATA%\nushell\env.nu`：
```nu
mkdir ~/.cache/starship
starship init nu | save -f ~/.cache/starship/init.nu
source ~/.cache/starship/init.nu
```

---

## 配置 lsd 别名

### PowerShell
```powershell
function ll { lsd -l --group-dirs first }
function la { lsd -la --group-dirs first }
function lt { lsd --tree --group-dirs first }
function lta { lsd --tree -a --group-dirs first }
Set-Alias -Name l. -Value lsd
```

### Nushell
```nu
def ll [] { lsd -l --group-dirs first }
def la [] { lsd -la --group-dirs first }
def lt [] { lsd --tree --group-dirs first }
def lta [] { lsd --tree -a --group-dirs first }
```

---

## Gum — 交互式 Shell 脚本工具

> 仓库：[charmbracelet/gum](https://github.com/charmbracelet/gum) ｜ 访问 Releases 查看最新版本

Gum 是一个用 Go 编写的交互式终端工具，提供 `input`、`choose`、`spin`、`confirm` 等组件，
让你用脚本就能轻松构建美观的 TUI 交互界面。

### 前置条件：安装 Go 语言工具链

`go install` 方式需要 Go。

访问 [https://go.dev/dl](https://go.dev/dl) 下载 Windows 安装包（`.msi`）并运行。

```powershell
go version
# 输出：go version go1.26.2 windows/amd64
```

> Go 安装后会自动将 `%USERPROFILE%\go\bin` 加入 PATH，`go install` 编译的二进制文件会放置在此目录。

---

### 方案 A：go install（编译安装）

```powershell
go install github.com/charmbracelet/gum@latest
```

> 编译较快（约 1~3 分钟），依赖 Go 工具链。

验证：

```powershell
gum --version
```

---

### 方案 B：GitHub Releases（下载预编译二进制）

Windows x86_64 下载最新版（访问 [Releases](https://github.com/charmbracelet/gum/releases) 获取实际链接）：

```powershell
# 下载
Invoke-WebRequest -Uri "https://github.com/charmbracelet/gum/releases/latest/download/gum_Windows_x86_64.zip" `
    -OutFile "$env:TEMP\gum.zip"

# 解压到工具目录
Expand-Archive -Path "$env:TEMP\gum.zip" -DestinationPath "D:\tools\bin\" -Force

# 验证
D:\tools\bin\gum.exe --version
```

---

### 使用示例

#### 输入框

```powershell
gum input --placeholder "输入项目名称..." --value "my-project"
```

#### 单选菜单

```powershell
# 简单选择
gum choose "Build" "Test" "Deploy" "Cancel"

# 带标题
gum choose --header "选择操作：" "Build" "Test" "Deploy" "Cancel"
```

#### 确认对话框

```powershell
if (gum confirm "确定要删除？" --default=false) {
    Write-Host "已确认删除" -ForegroundColor Red
} else {
    Write-Host "已取消" -ForegroundColor Green
}
```

#### 加载动画

```powershell
gum spin --spinner dot --title "正在处理..." -- sleep 3
```

#### 多行输入（编写文本）

```powershell
gum write --placeholder "输入备注..." --width 60 --height 10
```

#### 文件选择

```powershell
gum file $pwd
```

#### 过滤器（模糊搜索）

```powershell
# 管道传参给 gum filter 实现模糊搜索
Get-ChildItem -Name | gum filter
```

#### 实用脚本组合

```powershell
# 交互式创建新目录
$dir = gum input --placeholder "目录名"
if ($dir -and (gum confirm "创建 '$dir'？")) {
    New-Item -ItemType Directory -Name $dir -Force
    gum style --foreground 82 "✔ 已创建 $dir"
}
```

```powershell
# 带进度提示的文件搜索
$file = Get-ChildItem -Recurse -Name *.ps1 | gum filter --header "选择 PowerShell 脚本："
if ($file) {
    code $file
}
```

---

## Glow — 终端 Markdown 渲染器

> 仓库：[charmbracelet/glow](https://github.com/charmbracelet/glow) ｜ 访问 Releases 查看最新版本

Glow 是一个终端 Markdown 查看器，支持语法高亮、代码块渲染、表格、图片链接等，
让你在终端中直接阅读 `.md` 文件，比 `cat README.md` 好看得多（与之搭配使用）。

---

### 方案 A：go install（编译安装）

```powershell
go install github.com/charmbracelet/glow@latest
```

> 编译较快，依赖 Go 工具链。

验证：

```powershell
glow --version
```

---

### 方案 B：GitHub Releases（下载预编译二进制）

Windows x86_64 下载最新版（访问 [Releases](https://github.com/charmbracelet/glow/releases) 获取实际链接）：

```powershell
Invoke-WebRequest -Uri "https://github.com/charmbracelet/glow/releases/latest/download/glow_Windows_x86_64.zip" `
    -OutFile "$env:TEMP\glow.zip"
Expand-Archive -Path "$env:TEMP\glow.zip" -DestinationPath "D:\tools\bin\" -Force
D:\tools\bin\glow.exe --version
```

---

### 使用示例

#### 渲染 Markdown 文件

```powershell
# 最简用法
glow README.md

# 分页显示（大文件推荐）
glow README.md -p

# 纯文本输出（可管道）
glow README.md -s
```

#### 不缓存直接渲染

```powershell
glow README.md -a
```

#### 指定行号和宽度

```powershell
glow README.md --style light -w 100
```

#### 查看远程 Markdown（Stdin 管道）

```powershell
# 从 curl 管道
curl -sL https://raw.githubusercontent.com/charmbracelet/glow/main/README.md | glow

# 从 Get-Content 管道
Get-Content README.md | glow -
```

#### 交互式浏览模式（默认）

```powershell
# 不传参数时，glow 启动交互式 TUI 浏览当前目录所有 .md 文件
glow
```

#### 搭配 bat 使用

```powershell
# bat 看代码，glow 看文档
glow README.md
bat src/main.rs
```

---

## 安装 Nerd Font

1. 下载 `JetBrainsMono.zip` 从 [nerdfonts.com](https://www.nerdfonts.com/font-downloads)
2. 解压 → 全选 → 右键 → **安装**
3. 设置：Windows Terminal → 设置 → 配置文件 → 外观 → 字体 → `JetBrainsMono Nerd Font`
4. VS Code：`Ctrl + ,` → `terminal font`
