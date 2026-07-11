# Starship Pastel Powerline — Windows 配置指南

> Windows + PowerShell 环境下，使用 Cargo 安装 Starship 并配置 Pastel Powerline 彩虹主题的完整教程。

---

## 目录

- [1. 安装 Rust 工具链](#1-安装-rust-工具链)
- [2. 通过 Cargo 安装 Starship](#2-通过-cargo-安装-starship)
- [3. 配置 Pastel Powerline 主题](#3-配置-pastel-powerline-主题)
- [4. 初始化 Starship 到 PowerShell](#4-初始化-starship-到-powershell)
- [5. 安装 Nerd Font（解决乱码）](#5-安装-nerd-font解决乱码)
- [6. 验证生效](#6-验证生效)
- [常见问题](#常见问题)

---

## 1. 安装 Rust 工具链

Starship 发布在 [crates.io](https://crates.io/crates/starship) 上，因此需要先安装 Rust 工具链。

### 下载并安装 Rust

访问 [https://rustup.rs](https://rustup.rs)，下载 `rustup-init.exe`，双击运行。

安装完成后，打开 PowerShell 验证：

```powershell
rustc --version
cargo --version
```

输出示例：

```
rustc 1.80.0 (051478957 2024-07-21)
cargo 1.80.0 (376030c 2024-07-21)
```

> **注意**：安装 Rust 时，rustup 会自动将 `%USERPROFILE%\.cargo\bin` 添加到 PATH。如果后续命令找不到，请手动将 `C:\Users\<你的用户名>\.cargo\bin` 添加到系统环境变量 PATH 中，然后重新打开 PowerShell。

---

## 2. 通过 Cargo 安装 Starship

使用 `cargo install` 从 crates.io 安装 Starship：

```powershell
cargo install starship
```

> 这一步会从源码编译，耗时约 **5~15 分钟**，取决于你的网络和 CPU 性能。

安装完成后验证：

```powershell
starship --version
```

输出示例：

```
starship 1.26.0
```

### 可选：安装到指定目录

如果想安装到其他位置，可以用 `--root` 参数：

```powershell
cargo install starship --root D:\tools
```

然后将 `D:\tools\bin` 添加到 PATH。

---

## 3. 配置 Pastel Powerline 主题

### 3.1 创建配置文件

Starship 的配置文件路径为：

```
C:\Users\<你的用户名>\.config\starship.toml
```

> ⚠️ **关键注意**：`starship.toml` 是**文件**，不是目录！常见的错误是误将 `starship` 创建为目录，里面再放一个 `toml` 文件，这会导致 Starship 找不到配置。

确保 `.config` 目录存在：

```powershell
mkdir $env:USERPROFILE\.config -ErrorAction SilentlyContinue
```

### 3.2 写入 Pastel Powerline 配置

将以下内容写入 `%USERPROFILE%\.config\starship.toml`：

```toml
"$schema" = 'https://starship.rs/config-schema.json'

format = """
[](#9A348E)\
$os\
$username\
[](bg:#DA627D fg:#9A348E)\
$directory\
[](fg:#DA627D bg:#FCA17D)\
$git_branch\
$git_status\
[](fg:#FCA17D bg:#86BBD8)\
$c\
$elixir\
$elm\
$golang\
$gradle\
$haskell\
$java\
$julia\
$maven\
$nodejs\
$bun\
$nim\
$rust\
$scala\
[](fg:#86BBD8 bg:#06969A)\
$docker_context\
[](fg:#06969A bg:#33658A)\
$time\
[ ](fg:#33658A)\
"""

[username]
show_always = true
style_user = "bg:#9A348E"
style_root = "bg:#9A348E"
format = '[$user ]($style)'
disabled = false

[os]
style = "bg:#9A348E"
disabled = true

[directory]
style = "bg:#DA627D"
format = "[ $path ]($style)"
truncation_length = 3
truncation_symbol = "…/"

[directory.substitutions]
"Documents" = "󰈙 "
"Downloads" = " "
"Music" = " "
"Pictures" = " "

[c]
symbol = " "
style = "bg:#86BBD8"
format = '[ $symbol ($version) ]($style)'

[elixir]
symbol = " "
style = "bg:#86BBD8"
format = '[ $symbol ($version) ]($style)'

[elm]
symbol = " "
style = "bg:#86BBD8"
format = '[ $symbol ($version) ]($style)'

[git_branch]
symbol = ""
style = "bg:#FCA17D"
format = '[ $symbol $branch ]($style)'

[git_status]
style = "bg:#FCA17D"
format = '[$all_status$ahead_behind ]($style)'

[golang]
symbol = " "
style = "bg:#86BBD8"
format = '[ $symbol ($version) ]($style)'

[gradle]
style = "bg:#86BBD8"
format = '[ $symbol ($version) ]($style)'

[haskell]
symbol = " "
style = "bg:#86BBD8"
format = '[ $symbol ($version) ]($style)'

[java]
symbol = " "
style = "bg:#86BBD8"
format = '[ $symbol ($version) ]($style)'

[julia]
symbol = " "
style = "bg:#86BBD8"
format = '[ $symbol ($version) ]($style)'

[maven]
style = "bg:#86BBD8"
format = '[ $symbol ($version) ]($style)'

[nodejs]
symbol = ""
style = "bg:#86BBD8"
format = '[ $symbol ($version) ]($style)'

[bun]
symbol = ""
style = "bg:#86BBD8"
format = '[ $symbol ($version) ]($style)'

[nim]
symbol = "󰆥 "
style = "bg:#86BBD8"
format = '[ $symbol ($version) ]($style)'

[rust]
symbol = ""
style = "bg:#86BBD8"
format = '[ $symbol ($version) ]($style)'

[scala]
symbol = " "
style = "bg:#86BBD8"
format = '[ $symbol ($version) ]($style)'

[time]
disabled = false
time_format = "%R"
style = "bg:#33658A"
format = '[ ♥ $time ]($style)'
```

> 此配置来自 [starship.rs/presets/pastel-powerline](https://starship.rs/presets/pastel-powerline)。

### 3.3 用命令直接应用（推荐）

也可以一行命令自动下载写入：

```powershell
starship preset pastel-powerline -o $env:USERPROFILE\.config\starship.toml
```

> 如果提示覆盖，输入 `y` 确认。

---

## 4. 初始化 Starship 到 PowerShell

### 4.1 找到你的 PowerShell Profile 文件

在 PowerShell 中运行：

```powershell
$PROFILE
```

通常路径是：

```
C:\Users\<你的用户名>\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
```

> 对于 PowerShell 7（pwsh.exe），路径是：
> ```
> C:\Users\<你的用户名>\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
> ```

### 4.2 编辑 Profile 文件

#### 方法 A：用记事本打开

```powershell
notepad $PROFILE
```

#### 方法 B：一行命令写入

如果文件不存在，先创建：

```powershell
New-Item -Path $PROFILE -Type File -Force
```

然后写入初始化命令：

```powershell
'Invoke-Expression (&starship init powershell)' | Add-Content $PROFILE
```

### 4.3 验证 Profile 内容

```powershell
Get-Content $PROFILE
```

应该输出：

```
Invoke-Expression (&starship init powershell)
```

---

## 5. 安装 Nerd Font（解决乱码）

Pastel Powerline 使用了大量特殊 Unicode 符号（如 `` `` `` 等），普通终端字体不支持这些字符，会显示为方块或乱码。

### 推荐字体

| 字体 | 下载地址 |
|------|---------|
| **JetBrainsMono Nerd Font**（推荐） | https://www.nerdfonts.com/font-downloads |
| **MesloLGS Nerd Font** | https://github.com/ryanoasis/nerd-fonts/releases |
| **FiraCode Nerd Font** | https://github.com/ryanoasis/nerd-fonts/releases |

### 安装方法

1. 下载字体包（通常为 `.zip`）
2. 解压，找到 `完整字体名称 Nerd Font Complete.ttf` 或 `完整字体名称 Nerd Font Complete Mono.ttf`
3. 右键 → **安装**（或全选后右键 → 为所有用户安装）
4. 在终端或 VS Code 中设置该字体

### 在 Windows Terminal 中设置字体

打开 Windows Terminal → 设置（`Ctrl + ,`）→ 配置文件 → PowerShell → **外观** → 字体 → 选择 `JetBrainsMono Nerd Font`

### 在 VS Code 中设置字体

`Ctrl + ,` 打开设置 → 搜索 `terminal font` → 将 `Terminal > Integrated: Font Family` 设为：

```
JetBrainsMono Nerd Font
```

---

## 6. 验证生效

### 6.1 检查 Starship 配置是否正确加载

```powershell
starship print-config
```

如果输出了你的 Pastel Powerline 配置内容，说明配置文件位置正确。

### 6.2 重新加载 Profile

关闭当前 PowerShell 窗口，重新打开。或者直接运行：

```powershell
. $PROFILE
```

### 6.3 确认效果

如果一切正常，你会看到类似下图的分段彩虹色提示符：

```
 admin ~   main  ♥ 18:30 ❯
```

每个段块有不同颜色背景，从紫色 → 粉色 → 橙色 → 蓝色 → 青色 → 深蓝渐变。

---

## 常见问题

### ❌ 启动了但看不到彩虹颜色

**原因**：配置文件路径错误。

检查：
```powershell
Test-Path $env:USERPROFILE\.config\starship.toml
```

如果返回 `False`，说明配置文件位置不对。确保路径是：
```
C:\Users\Admin\.config\starship.toml    ← 文件，不是目录
```
而不是：
```
C:\Users\Admin\.config\starship\toml    ← ❌ 错把 starship 当目录了
```

### ❌ 提示符没有任何变化（还是默认的 PS 路径）

**原因**：PowerShell Profile 中没有添加 Starship 初始化。

检查：
```powershell
Get-Content $PROFILE
```

应该包含：
```
Invoke-Expression (&starship init powershell)
```

### ❌ 显示一堆方框或乱码

**原因**：终端字体不支持 Nerd Font 符号。

**解决**：安装 JetBrainsMono Nerd Font 或其他 Nerd Font 字体，并在终端设置中切换。

### ❌ cargo install 很慢

**原因**：从源码编译，且国内网络访问 crates.io 较慢。

**解决**：
1. 配置 Rust 镜像源，创建 `%USERPROFILE%\.cargo\config.toml`：
```toml
[source.crates-io]
replace-with = 'tuna'

[source.tuna]
registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"
```
2. 或使用 [scoop 安装](https://scoop.sh) 更快（预编译二进制）：
```powershell
scoop install starship
```

### ❌ starship 命令找不到

**原因**：`.cargo\bin` 没有在 PATH 中。

**解决**：手动将 `C:\Users\<你的用户名>\.cargo\bin` 添加到系统环境变量，或在 PowerShell profile 中添加：
```powershell
$env:Path += ";$env:USERPROFILE\.cargo\bin"
```

---

## 参考链接

- [Starship 官网](https://starship.rs)
- [Starship crates.io](https://crates.io/crates/starship)
- [Pastel Powerline 预设](https://starship.rs/presets/pastel-powerline)
- [Starship 配置文档](https://starship.rs/config/)
- [Nerd Fonts 下载](https://www.nerdfonts.com/font-downloads)
