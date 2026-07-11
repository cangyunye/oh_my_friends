---
name: terminal-beautify
description: >-
  跨平台终端美化与开发工具套件安装配置技能。当用户提到「配置开发套装」「配置终端美化」「美化我的 shell」「有什么 shell 或终端美化方案」「终端美化方案」「装一套开发工具」「配置 Starship」「配置 lsd/fzf/bat/ripgrep」时触发。
  触发时必须先向用户说明：「正在使用 terminal-beautify 技能来配置终端美化方案」，避免用户混淆。
  支持 Windows / Linux / macOS 三平台，自动检测当前操作系统并选择合适的安装策略。
  处理 Linux glibc 版本兼容性问题、源码编译依赖检测、GitHub 不可达时的降级方案。
  所有关键操作（安装软件、修改 PATH、写配置文件）前必须获得用户明确许可。
---

# terminal-beautify — 跨平台终端美化配置

## 工作流程总览

```
用户请求 → 显示技能提示 → 确认平台 → 申请权限 → 安装工具 → 配置 Shell → PATH 验证 → 完成报告
```

每一步都必须与用户确认后再推进。

---

## 0. 触发时第一时间告知用户

当技能被触发时，必须先输出：

> 🎨 **terminal-beautify 技能已激活** — 我正在帮你配置终端美化方案。
> 我会逐步向你确认每个操作，确保安全可控。
> 当前检测到的平台：**[Windows / Linux / macOS]**

然后等待用户确认再继续。

---

## 1. 平台检测

自动判断当前操作系统，不允许用户跨平台指定（除非明确要求生成配置文件供其他机器使用）。

| 检测方式 | Windows | Linux | macOS |
|----------|---------|-------|-------|
| 命令 | `$env:OS` | `uname -s` | `uname -s` |
| 特征值 | `Windows_NT` | `Linux` | `Darwin` |

对于 Linux，额外检测以下信息并告知用户：
- **发行版**: `/etc/os-release` 中的 `ID` 和 `VERSION_ID`
- **架构**: `uname -m`
- **glibc 版本**: `ldd --version | head -1` 提取版本号
  - 如果 glibc < 2.31（Ubuntu 20.04 以下），需要特别注意 Nushell、fd 等工具的版本兼容性

### 1.1 架构检测与 Rust target 映射

Linux 和 macOS 从 GitHub Releases 下载预编译二进制时，必须根据架构选择正确的文件。

**`uname -m` 输出 → Rust target 映射表：**

| `uname -m` | Linux Rust target | macOS Rust target |
|------------|------------------|-------------------|
| `x86_64` | `x86_64-unknown-linux-musl` 或 `x86_64-unknown-linux-gnu` | `x86_64-apple-darwin` |
| `aarch64` | `aarch64-unknown-linux-musl` 或 `aarch64-unknown-linux-gnu` | `aarch64-apple-darwin` |
| `armv7l` | `armv7-unknown-linux-musleabihf` | —（macOS 无 32位 ARM） |
| `riscv64` | `riscv64gc-unknown-linux-gnu` | — |

**工具对应的架构选择规则：**

| 工具 | Linux 首选 | macOS 首选 | 备注 |
|------|-----------|-----------|------|
| Starship | `x86_64-unknown-linux-musl` / `aarch64-unknown-linux-musl` | `aarch64-apple-darwin` / `x86_64-apple-darwin` | 使用 install.sh 自动选择 |
| ripgrep | `x86_64-unknown-linux-musl` | `aarch64-apple-darwin` / `x86_64-apple-darwin` | |
| fd | `x86_64-unknown-linux-musl` | `aarch64-apple-darwin` / `x86_64-apple-darwin` | |
| bat | `x86_64-unknown-linux-musl` | `aarch64-apple-darwin` / `x86_64-apple-darwin` | |
| lsd | `x86_64-unknown-linux-musl` | `aarch64-apple-darwin` / `x86_64-apple-darwin` | Linux 也可用 .deb 包 |
| Nushell | `x86_64-unknown-linux-musl` | `aarch64-apple-darwin` / `x86_64-apple-darwin` | |
| fzf | 独立架构名（见下方） | 独立架构名（见下方） | 不使用 Rust target 命名 |

**通用架构检测脚本（Linux/macOS）：**
```bash
ARCH=$(uname -m)
case "$ARCH" in
  x86_64)
    LINUX_TARGET="x86_64-unknown-linux-musl"
    MACOS_TARGET="x86_64-apple-darwin"
    FZF_ARCH="amd64"
    ;;
  aarch64)
    LINUX_TARGET="aarch64-unknown-linux-musl"
    MACOS_TARGET="aarch64-apple-darwin"
    FZF_ARCH="arm64"
    ;;
  armv7l)
    LINUX_TARGET="armv7-unknown-linux-musleabihf"
    FZF_ARCH="armv5"  # fzf armv5 兼容 armv7
    ;;
  *)
    echo "不支持的架构: $ARCH"
    exit 1
    ;;
esac

if [ "$(uname -s)" = "Darwin" ]; then
  TARGET=$MACOS_TARGET
  # macOS 上优先使用 brew，仅当 brew 不可用时才用 GitHub Releases
else
  TARGET=$LINUX_TARGET
fi
```

**示例：从 GitHub Releases 下载（Linux 通用）：**
```bash
wget -qO- "https://github.com/sharkdp/bat/releases/latest/download/bat-v0.26.1-${TARGET}.tar.gz" \
  | tar xz --strip-components=1 -C ~/.local/bin "bat-${TARGET}/bat"
```

---

## 2. 权限申请系统

每项操作前必须获得用户明确许可。使用逐项确认的方式：

```
❓ 需要执行以下操作，请确认：
  1. 使用 [cargo/brew/apt/winget] 安装 [工具列表]
  2. 创建配置文件 [路径]
  3. 修改 PATH 环境变量
  4. 写入 Shell 配置文件
  
  是否继续？(y/n)
```

**至少需要申请以下权限**：
- **安装权限**：允许安装/下载软件包
- **写入权限**：允许写入 Shell 配置文件（`$PROFILE` / `~/.bashrc` / `~/.zshrc` / `~/.config/nushell/*`）
- **PATH 修改权限**：允许修改 PATH 环境变量
- **网络权限**：允许从 GitHub/软件源下载

如果用户拒绝某项，跳过对应操作并说明后果。

---

## 3. Linux glibc 版本处理策略

对于 Linux 平台，必须检查 glibc 版本：

```bash
# 获取 glibc 版本
ldd --version 2>&1 | head -1 | grep -oP '\d+\.\d+'
```

### glibc 版本对照表

| 发行版 | glibc 版本 | 注意事项 |
|--------|-----------|---------|
| Ubuntu 22.04 | 2.35 ✅ | 可直接使用最新版预编译二进制 |
| Ubuntu 20.04 | 2.31 ⚠️ | Nushell ≥ 0.98 需 glibc 2.35+，需用旧版或源码编译 |
| Ubuntu 18.04 | 2.27 ❌ | 多数工具新版本不兼容，建议使用 cargo 编译或系统包管理器 |
| Debian 11 | 2.31 ⚠️ | 同上 |
| Debian 12 | 2.36 ✅ | 可直接使用 |

### glibc 不兼容时的降级策略（按优先级）

1. **使用系统包管理器**（apt）：版本较旧但兼容
2. **使用 cargo 源码编译**：不依赖 glibc 版本（需要 Rust 工具链）
3. **手动指定旧版本**：从 GitHub Releases 下载兼容旧 glibc 的版本
4. **通知用户**：如果以上都不行，告知用户具体哪个工具不兼容，询问是否跳过

---

## 4. 源码编译依赖检测

当选择 cargo 安装方式时：

| 工具 | 编程语言 | 检测命令 | 降级方案 |
|------|---------|---------|---------|
| Starship | Rust | `rustc --version` | GitHub Releases 下载 |
| ripgrep | Rust | `rustc --version` | GitHub Releases 下载 |
| fd | Rust | `rustc --version` | GitHub Releases 下载 |
| bat | Rust | `rustc --version` | GitHub Releases 下载 |
| lsd | Rust | `rustc --version` | GitHub Releases 下载 |
| zoxide | Rust | `rustc --version` | GitHub Releases 或 curl 安装脚本 |
| Nushell | Rust | `rustc --version` | GitHub Releases 下载 |
| fzf | Go | `go version` | GitHub Releases 或 git clone |
| Gum | Go | `go version` | GitHub Releases 下载 |
| Glow | Go | `go version` | GitHub Releases 下载 |

**流程**：
1. 用户选择了 cargo 安装方式
2. 检测对应语言工具链是否存在
3. 如果不存在，告知用户：「未检测到 Rust/Go 工具链，将自动降档为 GitHub Releases 下载预编译二进制」
4. 获得用户同意后切换到 GitHub Releases 方式

---

## 5. GitHub 不可达处理

当 GitHub Releases 下载失败时（网络错误、超时、DNS 解析失败）：

1. **检测 GitHub 可达性**：
   ```powershell
   # Windows
   Test-NetConnection -ComputerName github.com -Port 443 -WarningAction SilentlyContinue
   ```
   ```bash
   # Linux/macOS
   curl -s --connect-timeout 5 https://github.com > /dev/null 2>&1 && echo "reachable" || echo "unreachable"
   ```

2. **如果不可达，询问用户**：
   ```
   ❓ 无法连接到 github.com，请提供备选方案：
     1. 输入可访问的镜像/代理 URL（如 https://mirror.example.com/tools/）
     2. 输入本地文件路径（如 D:\downloads\tools\）
     3. 输入局域网/内网地址（如 http://192.168.1.100:8080/tools/）
     4. 跳过这个工具
     5. 尝试其他包管理器（apt/brew/choco/scoop）
   
     请回复数字或直接输入路径/URL：
   ```

3. **根据用户输入处理**：
   - 如果用户提供了 URL，使用该 URL 替换 GitHub 域名后下载
   - 如果用户提供了本地路径，从本地复制
   - 如果用户选择跳过，记录并继续
   - 如果用户选择包管理器，尝试系统包管理器

---

## 6. 工具安装矩阵

### 6.1 核心工具

| 工具 | Windows | Linux | macOS |
|------|---------|-------|-------|
| **Starship** | cargo / GitHub Releases | apt / cargo / GitHub Releases / install.sh | brew / cargo / GitHub Releases / install.sh |
| **ripgrep** | cargo / GitHub Releases | apt `ripgrep` / cargo / GitHub Releases | brew / cargo / GitHub Releases |
| **fd** | cargo / GitHub Releases | apt `fd-find` / cargo / GitHub Releases | brew / cargo / GitHub Releases |
| **bat** | cargo / GitHub Releases | apt `bat` → `batcat` 别名 / cargo / GitHub Releases | brew / cargo / GitHub Releases |
| **lsd** | cargo / GitHub Releases | apt (PPA) / cargo / GitHub Releases (.deb) | brew / cargo / GitHub Releases |
| **fzf** | GitHub Releases（官方 Go 版） | apt / git clone + install | brew / git clone + install |
| **zoxide** | cargo / GitHub Releases | apt / cargo / install.sh | brew / cargo / install.sh |
| **Nushell** | cargo / GitHub Releases | apt / cargo / GitHub Releases | brew / cargo / GitHub Releases |
| **Nerd Font** | 下载 zip → 右键安装 | 下载 → `~/.local/share/fonts` → `fc-cache` | brew cask / 手动安装 |

### 6.2 Charm 工具

| 工具 | 安装方式 |
|------|---------|
| **Gum** | `go install` / GitHub Releases |
| **Glow** | `go install` / GitHub Releases |

### 6.3 AI 工具

| 工具 | 安装方式 |
|------|---------|
| **OpenCode** | `npm install -g opencode-ai`（首选）/ 官方安装脚本 |
| **Oh My Pi** | `npm install -g @oh-my-pi/pi-coding-agent` / 官方安装脚本 |

### 6.4 编辑器

| 工具 | Windows | Linux | macOS |
|------|---------|-------|-------|
| **Zed** | winget / MSI | 官方脚本 | brew / 官方 dmg |
| **Helix** | cargo / GitHub Releases | apt / cargo / GitHub Releases | brew / cargo / GitHub Releases |

---

## 7. 备份系统（操作前必须执行）

每次修改文件或升级工具前，必须先备份原文件到平台特定的备份目录，并创建 JSON 恢复清单。

### 7.1 备份目录

| 平台 | 备份根路径 |
|------|-----------|
| Windows | `%LOCALAPPDATA%\terminal-beautify\backups\` |
| Linux | `~/.local/share/terminal-beautify/backups/` |
| macOS | `~/Library/Application Support/terminal-beautify/backups/` |

备份按时间戳组织：`backups/YYYYMMDD-HHmmss/`

### 7.2 恢复清单格式

每次操作后生成 `recovery-manifest.json`，Python 可直接读取：

```json
{
  "created_at": "2026-07-11T10:15:00",
  "platform": "windows",
  "hostname": "DESKTOP-ABC",
  "backups": [
    {
      "tool": "fzf",
      "original_path": "C:\\Users\\Admin\\.cargo\\bin\\fzf.exe",
      "backup_path": "C:\\Users\\Admin\\AppData\\Local\\terminal-beautify\\backups\\20260711-101500\\fzf.exe.backup",
      "old_version": "0.73.1",
      "new_version": "0.74.0",
      "action": "upgraded",
      "date": "2026-07-11T10:15:00"
    },
    {
      "config": "starship.toml",
      "original_path": "C:\\Users\\Admin\\.config\\starship.toml",
      "backup_path": "C:\\Users\\Admin\\AppData\\Local\\terminal-beautify\\backups\\20260711-101500\\starship.toml",
      "action": "backup_before_modify",
      "date": "2026-07-11T10:15:00"
    }
  ]
}
```

Python 读取示例：
```python
import json
data = json.load(open("recovery-manifest.json"))
for b in data["backups"]:
    print(f"{b['tool']}: {b['original_path']} → {b['backup_path']}")
```

### 7.3 备份规则

| 场景 | 备份要求 |
|------|---------|
| **升级已有工具** | 备份旧二进制 → 安装新版 → 记录到清单 |
| **修改配置文件** | 备份原文件 → 追加内容 → 记录到清单 |
| **首次安装** | 不需要备份（无旧文件） |

---

## 8. 安装目录与 PATH 验证

### 8.1 安装目录

根据平台选择默认安装目录，询问用户是否接受：

| 平台 | 默认目录 |
|------|---------|
| Windows | `%USERPROFILE%\.local\bin` |
| Linux | `~/.local/bin` |
| macOS | `~/.local/bin` |

如果目录不存在，询问是否创建。

### 8.2 PATH 验证

安装后必须验证工具是否在 PATH 中可访问：

```powershell
# Windows — 列出所有版本，检测 PATH 优先级冲突
Get-Command fzf -All -ErrorAction SilentlyContinue | ForEach-Object { "$($_.Source): $(& $_.Source --version)" }
```
```bash
# Linux / macOS — 检测是否多版本并存
which -a fzf 2>/dev/null; command -v starship rg fd bat lsd fzf zoxide nu
```

**PATH 冲突检测**：当一个工具名在 PATH 中出现多次时（例如 cargo 版的 fzf 和官方版 fzf 同时存在）：
1. 列出所有路径和版本号
2. 显示 PATH 优先级顺序（排在前面的目录优先）
3. 告知用户哪个版本会被实际调用
4. 如果多个目录中的版本不同，提示用户存在优先级冲突
5. **不要自动删除或移动旧版本**，仅报告并让用户决定

### 8.3 写入 Shell 配置文件

**基本原则：追加不覆盖，带标记可识别。** 不要覆盖整个文件，只在文件末尾追加配置块，并用清晰标记包裹：

```bash
# >>> terminal-beautify config >>>
# 终端美化工具 PATH 配置 (terminal-beautify)
export PATH="$HOME/.local/bin:$PATH"
# bat 别名
alias cat='bat'
alias ccat='\cat'
# <<< terminal-beautify config <<<
```

写入前必须：
1. 检测是否已存在相同标记的配置块
2. 如果已存在，告知用户并跳过（不重复追加）
3. 如果不存在，展示将要追加的内容，获得确认后再追加
4. 告知用户如需移除配置，直接删除两个标记之间的内容

各 Shell 配置文件路径：

| Shell | 配置文件路径 |
|-------|------------|
| PowerShell | `$PROFILE` |
| bash | `~/.bashrc` |
| zsh | `~/.zshrc` |
| Nushell env | `~/.config/nushell/env.nu` |
| Nushell config | `~/.config/nushell/config.nu` |

---

## 9. 工具升级流程

当检测到工具已安装，询问用户是否升级：

1. **检测当前版本**：运行 `tool --version`
2. **获取最新版本**：通过 GitHub API 或包管理器查询
3. **版本对比**：
   - 如果已是最新：告知用户，跳过
   - 如果有新版：显示新旧版本号，询问是否升级
4. **用户确认升级后**：
   - 备份旧文件到 7.1 定义的备份目录
   - 安装新版
   - 更新 recovery-manifest.json
5. **用户拒绝升级**：跳过，保持旧版

### fzf 安装特殊处理

fzf（junegunn/fzf）的 GitHub Releases 使用版本号 + 架构命名的文件，不能直接用 `latest/download` 固定 URL。
需通过 API 获取最新版本号，并根据平台和架构选择正确的文件。

**fzf 文件命名规则：** `fzf-{VERSION}-{OS}_{ARCH}.zip`（Windows）或 `.tar.gz`（Linux/macOS）

| 平台 | `uname -m` | fzf 架构后缀 |
|------|-----------|-------------|
| Windows | `AMD64` | `windows_amd64` |
| Windows | `ARM64` | `windows_arm64` |
| Linux | `x86_64` | `linux_amd64` |
| Linux | `aarch64` | `linux_arm64` |
| Linux | `armv7l` | `linux_armv5`（兼容） |
| Linux | `riscv64` | `linux_riscv64` |
| macOS Intel | `x86_64` | `darwin_amd64` |
| macOS Apple Silicon | `arm64` | `darwin_arm64` |

```powershell
# Windows: 通过 API 获取版本号 + 检测架构后构建下载 URL
$fzfVer = (Invoke-RestMethod "https://api.github.com/repos/junegunn/fzf/releases/latest").tag_name
$fzfArch = if ([Environment]::Is64BitOperatingSystem) { "amd64" } else { "arm64" }
Invoke-WebRequest -Uri "https://github.com/junegunn/fzf/releases/download/$fzfVer/fzf-$fzfVer-windows_$fzfArch.zip" -OutFile "$env:TEMP\fzf.zip"
Expand-Archive -Path "$env:TEMP\fzf.zip" -DestinationPath "D:\tools\bin\" -Force
```

```bash
# Linux/macOS: 检测架构后选择下载方式
ARCH=$(uname -m)
case "$ARCH" in
  x86_64)  FZF_ARCH="amd64" ;;
  aarch64|arm64) FZF_ARCH="arm64" ;;
  armv7l)  FZF_ARCH="armv5" ;;
  *)       echo "不支持的架构: $ARCH"; exit 1 ;;
esac

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
# macOS → darwin, Linux → linux
case "$OS" in
  darwin) FZF_OS="darwin" ;;
  linux)  FZF_OS="linux" ;;
  *)      echo "不支持的系统: $OS"; exit 1 ;;
esac

# 通过 API 获取最新版本号
FZF_VER=$(curl -sL "https://api.github.com/repos/junegunn/fzf/releases/latest" | grep tag_name | cut -d'"' -f4)

# 下载并解压
curl -sL "https://github.com/junegunn/fzf/releases/download/$FZF_VER/fzf-$FZF_VER-${FZF_OS}_${FZF_ARCH}.tar.gz" \
  | tar xz -C ~/.local/bin/
chmod +x ~/.local/bin/fzf
```

如果 GitHub API 不可达，可退回到官方 git clone 方式：
```bash
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install
```

---

## 10. 配置模板

### 10.1 Starship 主题

```powershell
mkdir -p ~/.config
starship preset pastel-powerline -o ~/.config/starship.toml
```

### 10.2 Shell 别名

根据平台和 Shell 配置 lsd、bat、fzf、fd、ripgrep、zoxide 的别名和初始化。配置内容以标记块形式追加到配置文件。

### 10.3 Nerd Font

推荐 JetBrainsMono Nerd Font，指导用户在终端模拟器中设置。

---

## 11. 完成报告

安装和配置完成后，必须输出详细报告，包含三部分：

### 11.1 安装结果

```
✅ terminal-beautify 配置完成！

=== 安装成功 ===
  - Starship  v1.26.0  (C:\Users\Admin\.local\bin\starship.exe)
  - bat       v0.26.1  (C:\Users\Admin\.local\bin\bat.exe)
  - fzf       v0.74.0  (C:\Users\Admin\.local\bin\fzf.exe)

=== 已跳过（无需操作） ===
  - ripgrep  已是最新版 v15.1.0
  - fd       已是最新版 v10.4.2

=== 安装失败 ===
  - Nushell  原因：用户拒绝安装
  - zoxide   原因：GitHub 不可达，且用户未提供备选路径

=== 备份记录 ===
  recovery-manifest.json → C:\Users\Admin\AppData\Local\terminal-beautify\backups\20260711-101500\

=== 配置修改 ===
  ✅ 已追加配置到: C:\Users\Admin\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1

=== ⚠️ 警告 ===
  ⚠️ 发现 PATH 优先级冲突：
     fzf 0.73.1 (cargo) 在 C:\Users\Admin\.cargo\bin\fzf.exe
     fzf 0.74.0 (官方) 在 C:\Users\Admin\.local\bin\fzf.exe
     当前 .cargo\bin 优先级高于 .local\bin，实际调用的是旧版
     如需使用官方版，请调整 PATH 顺序
  ⚠️ 需要重启终端或执行: . $PROFILE

❓ 还有什么需要调整的吗？
```

### 11.2 失败原因分类

报告失败时必须说明具体原因：

| 失败原因 | 说明 |
|---------|------|
| `用户拒绝` | 用户选择了跳过 |
| `GitHub 不可达` | 网络连接失败，且用户未提供备选路径 |
| `文件损坏` | 下载的文件不完整或校验失败 |
| `权限不足` | 需要管理员/root 权限 |
| `版本不兼容` | glibc 版本过低，无可用降级方案 |
| `依赖缺失` | 编译依赖缺失且无法降级 |

---

## 12. 错误处理

- **命令执行失败**：捕获错误信息，记录到报告，询问是否重试或跳过
- **权限不足**：提示用户以管理员/root 身份运行
- **磁盘空间不足**：提示用户清理空间
- **文件损坏**：删除损坏文件，询问是否重新下载
- **下载失败**：检测 GitHub 可达性，进入 5.2 的备选方案流程

---

## 参考文件说明

本技能附带以下参考文档，存储于 `references/` 目录：

| 文件 | 用途 |
|------|------|
| `windows-dev-toolkit/` | Windows 平台安装配置详细指南 |
| `linux-dev-toolkit/` | Linux 平台安装配置详细指南 |
| `macos-dev-toolkit/` | macOS 平台安装配置详细指南 |
| `starship-pastel-powerline-setup/` | Starship Pastel Powerline 主题配置 |

当需要具体安装命令或配置细节时，读取对应平台的参考文档。
