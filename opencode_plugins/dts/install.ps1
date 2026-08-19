#Requires -Version 5.1
<#
  dts opencode 插件安装脚本 (Windows)

  等价于 install.sh,做三件事:
  1. 在 %USERPROFILE%\.config\opencode\plugins\dts.ts 生成 loader(以 file:// URL 指向仓库源码)
  2. 把 command-dts.md 接到 %USERPROFILE%\.config\opencode\commands\dts.md(优先 symlink,失败退化为复制)
  3. 把 RULES.md 绝对路径写入全局 opencode.jsonc/json 的 instructions(JSONC 兼容)

  用法:
    powershell -ExecutionPolicy Bypass -File .\install.ps1
  或直接双击 install.bat
#>
$ErrorActionPreference = "Stop"

$cfg = if ($env:OPENCODE_CONFIG_DIR) { $env:OPENCODE_CONFIG_DIR } else { Join-Path $env:USERPROFILE ".config\opencode" }
$here = $PSScriptRoot

function Write-Utf8NoBom {
  param(
    [Parameter(ValueFromPipeline = $true)][string]$Content,
    [string]$Path
  )
  [System.IO.File]::WriteAllText($Path, $Content, (New-Object System.Text.UTF8Encoding $false))
}

New-Item -ItemType Directory -Force -Path (Join-Path $cfg "plugins"), (Join-Path $cfg "commands") | Out-Null

# 1. loader —— JS import 路径统一用正斜杠,并转成 file:// URL(Deno/Bun 均接受)
$loaderPath = Join-Path $cfg "plugins\dts.ts"
$srcUrl = "file:///" + ((Join-Path $here "dts.ts") -replace "\\", "/")
$loader = @(
  'import { tool } from "@opencode-ai/plugin"'
  "import { createDtsPlugin } from `"$srcUrl`""
  "export const DtsPlugin = createDtsPlugin(tool)"
) -join "`n"
Write-Utf8NoBom -Path $loaderPath -Content $loader
Write-Host "installed plugin loader -> $loaderPath"

# 2. /dts command —— symlink 需要开发者模式/管理员权限,失败退化为复制
$cmdTarget = Join-Path $cfg "commands\dts.md"
$cmdSrc = Join-Path $here "command-dts.md"
if (Test-Path $cmdTarget) { Remove-Item -Force $cmdTarget }
$linked = $false
try {
  New-Item -ItemType SymbolicLink -Path $cmdTarget -Target $cmdSrc -ErrorAction Stop | Out-Null
  $linked = $true
} catch {
  Copy-Item -Force $cmdSrc $cmdTarget
}
$mode = if ($linked) { "symlink" } else { "copy" }
Write-Host "installed /dts command    -> $cmdTarget ($mode)"
if (-not $linked) {
  Write-Warning "symlink 失败(需要开发者模式或管理员),已用复制代替:改动 command-dts.md 后需重新运行本脚本。"
}

# 3. 注册 instructions —— JSONC 兼容(容忍注释/尾逗号)
$configFile = Join-Path $cfg "opencode.jsonc"
if (-not (Test-Path $configFile)) { $configFile = Join-Path $cfg "opencode.json" }
if (-not (Test-Path $configFile)) { Write-Utf8NoBom -Path $configFile -Content "{}" }

function ConvertFrom-Jsonc {
  param([string]$text)
  # 去掉 // 与 /* */ 注释(字符串字面量内的保留),并清理尾逗号
  $sb = New-Object System.Text.StringBuilder
  $inStr = $false; $esc = $false; $i = 0; $n = $text.Length
  while ($i -lt $n) {
    $c = $text[$i]
    if ($inStr) {
      [void]$sb.Append($c)
      if ($esc) { $esc = $false }
      elseif ($c -eq '\') { $esc = $true }
      elseif ($c -eq '"') { $inStr = $false }
      $i++; continue
    }
    if ($c -eq '"') { $inStr = $true; [void]$sb.Append($c); $i++; continue }
    if ($c -eq '/' -and $i + 1 -lt $n -and $text[$i + 1] -eq '/') {
      while ($i -lt $n -and $text[$i] -ne "`n") { $i++ }
      continue
    }
    if ($c -eq '/' -and $i + 1 -lt $n -and $text[$i + 1] -eq '*') {
      $i += 2
      while ($i + 1 -lt $n -and -not ($text[$i] -eq '*' -and $text[$i + 1] -eq '/')) { $i++ }
      $i += 2
      continue
    }
    [void]$sb.Append($c); $i++
  }
  return ($sb.ToString() -replace ',\s*([}\]])', '$1')
}

$rule = Join-Path $here "RULES.md"
$raw = Get-Content -Raw -Path $configFile
$cfgObj = $null
try {
  $cfgObj = $raw | ConvertFrom-Json
} catch {
  $cfgObj = (ConvertFrom-Jsonc $raw) | ConvertFrom-Json
}
$inst = if ($null -eq $cfgObj.instructions) { @() } else { @($cfgObj.instructions) }
if ($inst -notcontains $rule) {
  $inst += $rule
  $cfgObj.instructions = $inst
  # 统一按合法 JSON 写出(.jsonc 同样合法),其余字段保留
  $cfgObj | ConvertTo-Json -Depth 20 | Write-Utf8NoBom -Path $configFile
}
Write-Host "registered instructions   -> $rule (in $configFile)"

Write-Host "done. restart opencode to load. verify: opencode run 'list your dts tools' in any project"
