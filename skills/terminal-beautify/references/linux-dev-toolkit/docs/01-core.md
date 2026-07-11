# Linux 终端工具套件 — 核心工具

> 针对 **Ubuntu 22.04 LTS** 优化。提供 **apt**、**cargo install** 和 **GitHub Releases** 三种安装方式。

---

- [安装前置条件](#安装前置条件)
- [方案 A：apt 安装](#方案-aapt-安装最快推荐)
- [方案 B：cargo install](#方案-bcargo-install从-cratesio-编译安装)
- [方案 C：GitHub Releases](#方案-cgithub-releases下载预编译二进制)
- [配置 Starship](#配置-starshipbash--zsh--nushell)
- [配置 lsd 别名](#配置-lsd-别名)
- [安装 Nerd Font](#安装-nerd-font)

---

## 安装前置条件

### Rust 工具链（可选，仅 cargo 方式需要）

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustc --version
cargo --version
```

### 基础依赖

```bash
sudo apt update
sudo apt install -y curl git build-essential pkg-config libssl-dev
```

---

## 方案 A：apt 安装（最快，推荐）

Ubuntu 22.04 官方源已包含大部分工具，但版本可能较旧。推荐从外部仓库获取最新版。

### 从官方源安装

```bash
sudo apt update
sudo apt install -y ripgrep fd-find bat fzf
```

> `bat` 安装后命令名为 `batcat`（与系统工具冲突），需设置别名：
> ```bash
> mkdir -p ~/.local/bin
> ln -s /usr/bin/batcat ~/.local/bin/bat
> ```

### 从外部仓库安装（版本更新）

```bash
# Starship
curl -sS https://starship.rs/install.sh | sh

# lsd
wget -qO- https://github.com/lsd-rs/lsd/releases/latest/download/lsd-musl_amd64.deb | sudo dpkg -i -

# Nushell
wget -qO- https://github.com/nushell/nushell/releases/latest/download/nu-x86_64-unknown-linux-musl.tar.gz | sudo tar xz -C /usr/local/bin

# zoxide
curl -sS https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh
```

### 验证安装

```bash
starship --version
rg --version
fd --version
bat --version
lsd --version
fzf --version
zoxide --version
nu --version
```

---

## 方案 B：cargo install（从 crates.io 编译安装）

> 优点：一条命令搞定，自动获取最新版。
> 缺点：需要编译，耗时较长（5~20 分钟/每个）。

### 镜像加速（国内推荐）

创建 `$HOME/.cargo/config.toml`：

```toml
[source.crates-io]
replace-with = 'tuna'

[source.tuna]
registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"
```

### 批量安装

```bash
cargo install starship ripgrep fd-find nu bat lsd zoxide --locked
```

> `fzf` 为 Go 项目，建议使用 apt 或预编译二进制安装。

### 升级所有工具

```bash
cargo install starship ripgrep fd-find nu bat lsd --locked
```

---

## 方案 C：GitHub Releases（下载预编译二进制）

> 优点：下载即用，无需编译。
> 缺点：需要手动配置 PATH。

### 安装到 `~/.local/bin`

```bash
mkdir -p ~/.local/bin
export PATH="$HOME/.local/bin:$PATH"
```

将 `export PATH` 添加到 `~/.bashrc` 或 `~/.zshrc` 使其永久生效。

### 各工具安装命令

```bash
# Starship
curl -sS https://starship.rs/install.sh | sh -s -- -b ~/.local/bin

# ripgrep
wget -qO- https://github.com/BurntSushi/ripgrep/releases/latest/download/ripgrep-x86_64-unknown-linux-musl.tar.gz \
  | tar xz --strip-components=1 -C ~/.local/bin ripgrep-x86_64-unknown-linux-musl/rg

# fd
wget -qO- https://github.com/sharkdp/fd/releases/latest/download/fd-x86_64-unknown-linux-musl.tar.gz \
  | tar xz --strip-components=1 -C ~/.local/bin fd-x86_64-unknown-linux-musl/fd

# bat
wget -qO- https://github.com/sharkdp/bat/releases/latest/download/bat-x86_64-unknown-linux-musl.tar.gz \
  | tar xz --strip-components=1 -C ~/.local/bin bat-x86_64-unknown-linux-musl/bat

# lsd
wget -qO /tmp/lsd.deb https://github.com/lsd-rs/lsd/releases/latest/download/lsd-musl_amd64.deb
sudo dpkg -i /tmp/lsd.deb

# fzf
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install

# zoxide
curl -sS https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | bash
mv ~/.local/bin/zoxide ~/.local/bin/

# Nushell
wget -qO- https://github.com/nushell/nushell/releases/latest/download/nu-x86_64-unknown-linux-musl.tar.gz \
  | tar xz -C ~/.local/bin
```

---

## 配置 Starship（bash / zsh / Nushell）

### 创建配置文件

```bash
mkdir -p ~/.config
starship preset pastel-powerline -o ~/.config/starship.toml
```

> 配置路径：`~/.config/starship.toml`

### bash

编辑 `~/.bashrc`：

```bash
eval "$(starship init bash)"
```

### zsh

编辑 `~/.zshrc`：

```bash
eval "$(starship init zsh)"
```

### Nushell

编辑 `~/.config/nushell/env.nu`：

```nu
mkdir ~/.cache/starship
starship init nu | save -f ~/.cache/starship/init.nu
source ~/.cache/starship/init.nu
```

编辑 `~/.config/nushell/config.nu`：

```nu
# Nushell 0.98+ 使用 $env.PROMPT_COMMANDLINE（$env.PROMPT_COMMAND 仍兼容）
$env.PROMPT_COMMAND = {||
    (starship prompt --cmd-duration $env.CMD_DURATION_MS --status $env.LAST_EXIT_CODE)
}
$env.PROMPT_COMMAND_RIGHT = ''
$env.PROMPT_INDICATOR = ''
$env.PROMPT_MULTILINE_INDICATOR = '::: '
```

---

## 配置 lsd 别名

### bash

编辑 `~/.bashrc`：

```bash
alias ll='lsd -l --group-dirs first'
alias la='lsd -la --group-dirs first'
alias lt='lsd --tree --group-dirs first'
alias lta='lsd --tree -a --group-dirs first'
alias l.='lsd'
```

### zsh

编辑 `~/.zshrc`：同上。

### Nushell

编辑 `~/.config/nushell/config.nu`：

```nu
def ll [] { lsd -l --group-dirs first }
def la [] { lsd -la --group-dirs first }
def lt [] { lsd --tree --group-dirs first }
def lta [] { lsd --tree -a --group-dirs first }
```

---

## 安装 Nerd Font

所有工具（Starship、lsd、bat）的图标都依赖 Nerd Font。

### 推荐字体

| 字体 | 下载 |
|------|------|
| **JetBrainsMono Nerd Font** | https://www.nerdfonts.com/font-downloads |
| **Meslo Nerd Font** | https://github.com/ryanoasis/nerd-fonts/releases |
| **FiraCode Nerd Font** | https://github.com/ryanoasis/nerd-fonts/releases |

### 安装

```bash
mkdir -p ~/.local/share/fonts
wget -qO /tmp/JetBrainsMono.zip https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.zip
unzip -q /tmp/JetBrainsMono.zip -d ~/.local/share/fonts/JetBrainsMono
fc-cache -fv
```

### 终端字体设置

- **GNOME Terminal**：编辑 → 首选项 → 自定义字体 → `JetBrainsMono Nerd Font`
- **VS Code**：`Ctrl + ,` → `terminal font` → `JetBrainsMono Nerd Font`
- **Kitty**：编辑 `kitty.conf` → `font_family JetBrainsMono Nerd Font`
- **Alacritty**：编辑 `alacritty.toml` → `[font] normal = { family = "JetBrainsMono Nerd Font" }`
