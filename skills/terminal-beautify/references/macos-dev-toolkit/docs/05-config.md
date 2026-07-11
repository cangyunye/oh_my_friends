# macOS — 配置模板与快速参考

---

## zsh 完整配置模板（`~/.zshrc`）

```zsh
# ═══════════════════════════════════════════════════════
# macOS Dev Toolkit — zsh Profile
# ═══════════════════════════════════════════════════════

# ── Homebrew PATH（Apple Silicon）───────────────────────
eval "$(/opt/homebrew/bin/brew shellenv)"

# ── 自定义 PATH ─────────────────────────────────────────
export PATH="$HOME/.local/bin:$PATH"

# ── Starship ────────────────────────────────────────────
eval "$(starship init zsh)"

# ── zoxide ──────────────────────────────────────────────
eval "$(zoxide init zsh)"

# ── lsd 别名 ────────────────────────────────────────────
alias ll='lsd -l --group-dirs first'
alias la='lsd -la --group-dirs first'
alias lt='lsd --tree --group-dirs first'
alias lta='lsd --tree -a --group-dirs first'
alias l.='lsd'

# ── bat 别名 ────────────────────────────────────────────
alias cat='bat'
alias ccat='\cat'

# ── fzf 集成 ────────────────────────────────────────────
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

# ── ripgrep 别名 ────────────────────────────────────────
alias grep='rg'
alias search='rg --no-heading -n'

# ── fd 别名 ─────────────────────────────────────────────
alias findf='fd --type f'
alias findd='fd --type d'

# ── macOS 快捷操作 ──────────────────────────────────────
alias showfiles='defaults write com.apple.finder AppleShowAllFiles YES && killall Finder'
alias hidefiles='defaults write com.apple.finder AppleShowAllFiles NO && killall Finder'
alias flushdns='sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder'
alias ..='cd ..'
alias ...='cd ../..'

# ── 自动补全增强 ────────────────────────────────────────
autoload -Uz compinit && compinit
zstyle ':completion:*' menu select
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Z}'

# ── Homebrew 自动更新 ───────────────────────────────────
export HOMEBREW_NO_AUTO_UPDATE=1
```

## Nushell 配置模板

`~/.config/nushell/env.nu`：
```nu
if (sys host | get name) =~ "Darwin" {
    if (uname -m) == "arm64" {
        $env.PATH = ($env.PATH | split row (char esep) | prepend '/opt/homebrew/bin' '/opt/homebrew/sbin')
    }
}
$env.PATH = ($env.PATH | split row (char esep) | prepend '~/.local/bin')
mkdir ~/.cache/starship
starship init nu | save -f ~/.cache/starship/init.nu
source ~/.cache/starship/init.nu

mkdir ~/.cache/zoxide
zoxide init nushell | save -f ~/.cache/zoxide/init.nu
source ~/.cache/zoxide/init.nu
```

`~/.config/nushell/config.nu`：
```nu
def ll  [] { lsd -l --group-dirs first }
def la  [] { lsd -la --group-dirs first }
def lt  [] { lsd --tree --group-dirs first }
def lta [] { lsd --tree -a --group-dirs first }
def cat [...args] { bat ...$args }
def grep [...args] { rg ...$args }
def search [...args] { rg --no-heading -n ...$args }
def findf [...args] { fd --type f ...$args }
def findd [...args] { fd --type d ...$args }
# Nushell 0.98+ 使用 $env.PROMPT_COMMANDLINE（$env.PROMPT_COMMAND 仍兼容）
$env.PROMPT_COMMAND = {|| (starship prompt --cmd-duration $env.CMD_DURATION_MS --status $env.LAST_EXIT_CODE) }
$env.PROMPT_COMMAND_RIGHT = ''
$env.PROMPT_INDICATOR = ''
$env.PROMPT_MULTILINE_INDICATOR = '::: '
$env.config = { show_banner: false  ls: { use_ls_colors: true  clickable_links: true }  rm: { always_trash: true }  table: { mode: rounded }  history: { max_size: 10000  sync_on_enter: true  file_format: "plaintext" }  completions: { case_sensitive: false  quick: true  partial: true  algorithm: "fuzzy" }  filesize: { metric: true  format: "auto" } }
```

### Starship初始化主题

```bash
starship preset catppuccin-powerline -o ~/.config/starship.toml --force 
```

---

## 快速参考（zsh 命令）

```bash
starship print-config                   # 查看配置
starship preset --list                  # 列出预设
starship preset pastel-powerline -o ~/.config/starship.toml
starship toggle disabled                # 启用/禁用

rg "pattern"                            # 搜索
rg -i "pattern"                         # 忽略大小写
rg -w "word"                            # 精确匹配
rg -l "pattern"                         # 只输出文件名

fd "pattern"                            # 搜索文件名
fd -e md                                # 搜索 .md
fd --type d "dir"                       # 搜索目录
fd --type f "file"                      # 搜索文件

bat file.txt                            # 语法高亮
bat --language=rs file                  # 强制语言

l.                                      # 图标+颜色
ll                                      # 详细列表
la                                      # 包含隐藏
lt                                      # 树形

z <目录名>                              # 跳转
zi                                      # 交互选择
```

## 检查已安装版本

```zsh
function dev-version {
    echo "════════════════════════════════════════"
    echo "  Starship  $(starship --version 2>&1 | head -1)"
    echo "  ripgrep   $(rg --version 2>&1 | head -1)"
    echo "  fd        $(fd --version 2>&1)"
    echo "  bat       $(bat --version 2>&1 | head -1)"
    echo "  lsd       $(lsd --version 2>&1 | head -1)"
    echo "  fzf       $(fzf --version 2>&1)"
    echo "  zoxide    $(zoxide --version 2>&1)"
    echo "  nu        $(nu --version 2>&1)"
    echo "  Helix     $(hx --version 2>&1 | head -1)"
    echo "  Zed       $(zed --version 2>&1 | head -1)"
    echo "════════════════════════════════════════"
}
```

---

## Intel vs Apple Silicon 对照

| 项目 | Intel Mac | Apple Silicon (M1/M2/M3/M4) |
|------|-----------|-----------------------------|
| 架构 | `x86_64` | `arm64` |
| Homebrew 路径 | `/usr/local` | `/opt/homebrew` |
| Homebrew shellenv | `/usr/local/bin/brew` | `/opt/homebrew/bin/brew` |
| 工具兼容性 | 全部支持 | 原生 arm64，Rosetta 可选 |
| 建议安装方式 | brew | brew（已提供 arm64 二进制） |
