# macOS — 核心工具

> 针对 **macOS** 优化（兼容 Intel 和 Apple Silicon）。
> 提供 **Homebrew**、**cargo install** 和 **GitHub Releases** 三种安装方式。

---

## 前置条件

### Apple Silicon（M1/M2/M3/M4）注意事项

Apple Silicon 使用 `arm64`，Homebrew 安装到 `/opt/homebrew`。Intel 使用 `x86_64`，安装到 `/usr/local`。

```bash
uname -m
# arm64 → Apple Silicon
# x86_64 → Intel
```

### 安装 Homebrew（如未安装）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Apple Silicon：**
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**Intel：**
```bash
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/usr/local/bin/brew shellenv)"
```

### 安装 Rust 工具链（可选，仅 cargo 方式需要）

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustc --version
cargo --version
```

---

## 方案 A：Homebrew 安装（最强推荐）

```bash
brew install starship ripgrep fd bat lsd fzf zoxide nushell

# fzf 额外配置
$(brew --prefix fzf)/install
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

### 升级所有工具

```bash
brew update && brew upgrade
```

---

## 方案 B：cargo install（从 crates.io 编译安装）

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

> `fzf` 为 Go 项目，建议使用 Homebrew 安装。

---

## 方案 C：GitHub Releases（下载预编译二进制）

```bash
mkdir -p ~/.local/bin
export PATH="$HOME/.local/bin:$PATH"
```

将 `export PATH` 添加到 `~/.zshrc` 使其永久生效。

各工具安装命令（自动检测架构）：

```bash
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then TARGET="aarch64-apple-darwin"; else TARGET="x86_64-apple-darwin"; fi

# Starship
curl -sS https://starship.rs/install.sh | sh -s -- -b ~/.local/bin

# ripgrep
wget -qO- "https://github.com/BurntSushi/ripgrep/releases/latest/download/ripgrep-${TARGET}.tar.gz" | tar xz --strip-components=1 -C ~/.local/bin "ripgrep-${TARGET}/rg"

# fd
wget -qO- "https://github.com/sharkdp/fd/releases/latest/download/fd-${TARGET}.tar.gz" | tar xz --strip-components=1 -C ~/.local/bin "fd-${TARGET}/fd"

# bat
wget -qO- "https://github.com/sharkdp/bat/releases/latest/download/bat-${TARGET}.tar.gz" | tar xz --strip-components=1 -C ~/.local/bin "bat-${TARGET}/bat"

# lsd
wget -qO- "https://github.com/lsd-rs/lsd/releases/latest/download/lsd-${TARGET}.tar.gz" | tar xz --strip-components=1 -C ~/.local/bin "lsd-${TARGET}/lsd"

# fzf
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install

# zoxide
curl -sS https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | bash

# Nushell
wget -qO- "https://github.com/nushell/nushell/releases/latest/download/nu-${TARGET}.tar.gz" | tar xz -C ~/.local/bin
```

---

## 配置 Starship（zsh / Nushell）

```bash
mkdir -p ~/.config
starship preset pastel-powerline -o ~/.config/starship.toml
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

---

## 配置 lsd 别名

### zsh

编辑 `~/.zshrc`：
```zsh
alias ll='lsd -l --group-dirs first'
alias la='lsd -la --group-dirs first'
alias lt='lsd --tree --group-dirs first'
alias lta='lsd --tree -a --group-dirs first'
alias l.='lsd'
```

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

### 方法 A：Homebrew（推荐）

```bash
brew install --cask font-jetbrains-mono-nerd-font
```

### 方法 B：手动安装

```bash
mkdir -p ~/Library/Fonts
wget -qO /tmp/JetBrainsMono.zip https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.zip
unzip -q /tmp/JetBrainsMono.zip -d ~/Library/Fonts/JetBrainsMono
```

### 终端字体设置

- **Terminal.app**：设置 → 描述文件 → 字体 → `JetBrainsMono Nerd Font`
- **iTerm2**：设置 → Profiles → Text → Font
- **Warp**：设置 → Themes → Font
- **VS Code**：`Cmd + ,` → `terminal font`
