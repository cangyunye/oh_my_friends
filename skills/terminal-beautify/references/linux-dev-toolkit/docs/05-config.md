# Linux — 配置模板与快速参考

---

## 完整配置模板

### bash（`~/.bashrc`）

```bash
# ═══════════════════════════════════════════════════════
# Linux Dev Toolkit — bash Profile
# ═══════════════════════════════════════════════════════

export PATH="$HOME/.local/bin:$PATH"

# ── Starship ────────────────────────────────────────────
eval "$(starship init bash)"
# ── zoxide ──────────────────────────────────────────────
eval "$(zoxide init bash)"

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
source /usr/share/doc/fzf/examples/key-bindings.bash
source /usr/share/doc/fzf/examples/completion.bash

# ── ripgrep 别名 ────────────────────────────────────────
alias grep='rg'
alias search='rg --no-heading -n'

# ── fd 别名 ─────────────────────────────────────────────
alias findf='fd --type f'
alias findd='fd --type d'

# ── 快捷操作 ────────────────────────────────────────────
alias ..='cd ..'
alias ...='cd ../..'
alias du='du -sh'
alias df='df -h'
```

### zsh（`~/.zshrc`）

```zsh
export PATH="$HOME/.local/bin:$PATH"

eval "$(starship init zsh)"
eval "$(zoxide init zsh)"

alias ll='lsd -l --group-dirs first'
alias la='lsd -la --group-dirs first'
alias lt='lsd --tree --group-dirs first'
alias lta='lsd --tree -a --group-dirs first'
alias l.='lsd'
alias cat='bat'
alias ccat='\cat'
alias grep='rg'
alias search='rg --no-heading -n'
alias findf='fd --type f'
alias findd='fd --type d'
alias ..='cd ..'
alias ...='cd ../..'

source /usr/share/zsh/fzf/key-bindings.zsh 2>/dev/null || source /usr/share/doc/fzf/examples/key-bindings.zsh
source /usr/share/zsh/fzf/completion.zsh 2>/dev/null || source /usr/share/doc/fzf/examples/completion.zsh

autoload -Uz compinit && compinit
zstyle ':completion:*' menu select
```

### Nushell

`~/.config/nushell/env.nu`：
```nu
mkdir ~/.cache/starship
starship init nu | save -f ~/.cache/starship/init.nu
source ~/.cache/starship/init.nu

mkdir ~/.cache/zoxide
zoxide init nushell | save -f ~/.cache/zoxide/init.nu
source ~/.cache/zoxide/init.nu

$env.PATH = ($env.PATH | split row (char esep) | prepend '~/.local/bin')
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
$env.PROMPT_COMMAND = {||
    (starship prompt --cmd-duration $env.CMD_DURATION_MS --status $env.LAST_EXIT_CODE)
}
$env.PROMPT_COMMAND_RIGHT = ''
$env.PROMPT_INDICATOR = ''
$env.PROMPT_MULTILINE_INDICATOR = '::: '

$env.config = {
    show_banner: false
    ls: { use_ls_colors: true  clickable_links: true }
    rm: { always_trash: true }
    table: { mode: rounded }
    history: { max_size: 10000  sync_on_enter: true  file_format: "plaintext" }
    completions: { case_sensitive: false  quick: true  partial: true  algorithm: "fuzzy" }
    filesize: { metric: true  format: "auto" }
}
```

### Starship初始化主题

```bash
starship preset catppuccin-powerline -o ~/.config/starship.toml --force 
```

---

## 各工具快速参考

### Starship
```bash
starship print-config                    # 查看当前配置
starship preset --list                   # 列出预设
starship preset pastel-powerline -o ~/.config/starship.toml
starship toggle disabled                 # 临时启用/禁用
```

### ripgrep (rg)
```bash
rg "pattern"            # 递归搜索
rg -i "pattern"         # 忽略大小写
rg -w "word"            # 精确匹配
rg -l "pattern"         # 只输出文件名
rg "pattern" --type rust
```

### fd
```bash
fd "pattern"            # 搜索文件名
fd -e md                # 搜索所有 .md
fd --type d "dir"       # 只搜索目录
fd --type f "file"      # 只搜索文件
fd --hidden "config"    # 包含隐藏文件
```

### bat
```bash
bat file.txt            # 语法高亮
bat --language=rs file  # 强制语言
bat -A file.txt         # 显示所有字符
```

### lsd
```bash
l.                      # 图标+颜色
ll                      # 详细列表
la                      # 包含隐藏文件
lt                      # 树形结构
lsd -l --total-size     # 显示总大小
```

### fzf
```bash
# Ctrl+T 选择文件  Ctrl+R 搜索历史
find . -type f | fzf
rg -l "TODO" | fzf
```

### zoxide
```bash
z <目录名>              # 跳转
zi                      # 交互式选择
```

---

## 检查已安装版本

```bash
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
