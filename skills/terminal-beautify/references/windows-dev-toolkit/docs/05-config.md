# Windows — 配置模板与快速参考

---

## PowerShell 完整配置模板（`$PROFILE`）

```powershell
# ═══════════════════════════════════════════════════════
# Windows Dev Toolkit — PowerShell Profile
# ═══════════════════════════════════════════════════════

# ── Starship ────────────────────────────────────────────
Invoke-Expression (&starship init powershell)

# ── zoxide ──────────────────────────────────────────────
Invoke-Expression (& { (zoxide init powershell | Out-String) })

# ── lsd 别名 ────────────────────────────────────────────
function ll  { lsd -l --group-dirs first }
function la  { lsd -la --group-dirs first }
function lt  { lsd --tree --group-dirs first }
function lta { lsd --tree -a --group-dirs first }
Set-Alias -Name l. -Value lsd

# ── bat 别名 ────────────────────────────────────────────
function cat { bat $args }
function ccat { Get-Content $args }

# ── fzf 集成 ────────────────────────────────────────────
Set-PSReadLineKeyHandler -Key Ctrl+t -ScriptBlock { $fzf = fzf | Out-String; if ($fzf) { $fzf.Trim() } }
Set-PSReadLineKeyHandler -Key Ctrl+r -Function ReverseSearchHistory

# ── ripgrep 别名 ────────────────────────────────────────
function grep { rg $args }
function search { rg --no-heading -n $args }

# ── fd 别名 ─────────────────────────────────────────────
function findf { fd --type f $args }
function findd { fd --type d $args }

# ── 色彩主题（One Dark） ────────────────────────────────
$psReadLineColors = @{
    Command = '#57C7FF'; Parameter = '#FCA17D'; String = '#98C379'
    Comment = '#5C6370'; Number = '#D19A66'; Variable = '#C678DD'
    Keyword = '#E5C07B'; Operator = '#56B6C2'; Type = '#E5C07B'
    Member = '#61AFEF'; Default = '#ABB2BF'
}
Set-PSReadLineOption -Colors $psReadLineColors

$Host.UI.RawUI.ForegroundColor = 'White'
$Host.UI.RawUI.BackgroundColor = 'Black'
# 注意：以下属性为 System.ConsoleColor 枚举类型，仅支持枚举名称
# 如升级到 PowerShell 7+，可使用 RGB 颜色（例：'#E06C75'）
$Host.PrivateData.ErrorForegroundColor = 'Red'       # ≈ #E06C75
$Host.PrivateData.WarningForegroundColor = 'Yellow'   # ≈ #E5C07B
$Host.PrivateData.DebugForegroundColor = 'Cyan'      # ≈ #56B6C2
$Host.PrivateData.VerboseForegroundColor = 'Blue'     # ≈ #61AFEF
$Host.PrivateData.ProgressForegroundColor = 'Magenta' # ≈ #C678DD

if ($PSVersionTable.PSVersion.Major -ge 7) {
    $PSStyle.FileInfo.Directory = "`e[38;2;86;182;194m"
    $PSStyle.FileInfo.Script = "`e[38;2;152;195;121m"
    $PSStyle.FileInfo.Executable = "`e[38;2;229;192;123m"
}
```

## Nushell 配置模板

`%APPDATA%\nushell\env.nu`：
```nu
mkdir ~/.cache/starship
starship init nu | save -f ~/.cache/starship/init.nu
source ~/.cache/starship/init.nu

mkdir ~/.cache/zoxide
zoxide init nushell | save -f ~/.cache/zoxide/init.nu
source ~/.cache/zoxide/init.nu
```

`%APPDATA%\nushell\config.nu`：
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
$env.config = { show_banner: false  ls: { use_ls_colors: true }  rm: { always_trash: true }  table: { mode: rounded }  history: { max_size: 10000 } }
```

### Starship初始化主题

```powershell
starship preset gruvbox-rainbow -o %USERPROFILE%\.config\starship.toml
```

---

## 快速参考（PowerShell 命令）

```powershell
starship print-config          # 查看配置
starship preset --list         # 列出预设
starship toggle disabled       # 启用/禁用

rg "pattern"                   # 搜索
rg -i "pattern"                # 忽略大小写
rg -w "word"                   # 精确匹配
rg -l "pattern"                # 只输出文件名

fd "pattern"                   # 搜索文件名
fd -e md                       # 搜索 .md
fd --type d "dir"              # 搜索目录
fd --type f "file"             # 搜索文件

bat file.txt                   # 语法高亮
bat --language=rs file         # 强制语言

l.                             # 图标+颜色
ll                             # 详细列表
la                             # 包含隐藏
lt                             # 树形

z <目录名>                     # zoxide 跳转
zi                             # 交互式选择
zoxide query <关键词>           # 查询最近路径

dir /s /b | fzf                # fzf 搜索
Get-ChildItem -Recurse | fzf

# ── Gum ────────────────────────────────────────────────
gum input --placeholder "输入..."           # 输入框
gum choose "A" "B" "C"                    # 选择菜单
gum confirm "确定？"                         # 确认对话框
gum spin -- sleep 3                        # 加载动画
gum write --placeholder "备注..."            # 多行文本
gum file                                    # 文件选择器
Get-ChildItem -Name | gum filter            # 模糊过滤

# ── Glow ───────────────────────────────────────────────
glow README.md                             # 渲染 Markdown
glow -p README.md                          # 分页模式
glow -a README.md                          # 不缓存
curl -sL <url> | glow                       # 渲染远程 MD
```

## 检查已安装版本

```powershell
function dev-version {
    Write-Host "═" * 40 -ForegroundColor Cyan
    Write-Host "  Starship  " -NoNewline; starship --version | Select-Object -First 1
    Write-Host "  ripgrep   " -NoNewline; rg --version | Select-Object -First 1
    Write-Host "  fd        " -NoNewline; fd --version
    Write-Host "  bat       " -NoNewline; bat --version | Select-Object -First 1
    Write-Host "  lsd       " -NoNewline; lsd --version | Select-Object -First 1
    Write-Host "  fzf       " -NoNewline; fzf --version
    Write-Host "  gum       " -NoNewline; if (Get-Command gum -ErrorAction SilentlyContinue) { gum --version } else { Write-Host "未安装" }
    Write-Host "  glow      " -NoNewline; if (Get-Command glow -ErrorAction SilentlyContinue) { glow --version } else { Write-Host "未安装" }
    Write-Host "  zoxide    " -NoNewline; zoxide --version | Select-Object -First 1
    Write-Host "  nu        " -NoNewline; nu --version
    Write-Host "  Zed       " -NoNewline; if (Get-Command zed -ErrorAction SilentlyContinue) { zed --version | Select-Object -First 1 } else { Write-Host "未安装" }
    Write-Host "═" * 40 -ForegroundColor Cyan
}
```
