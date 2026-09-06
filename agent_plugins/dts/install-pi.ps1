#Requires -Version 5.1
<#
  dts pi agent 插件安装脚本 (Windows)

  等价于 install-pi.sh,做一件事:
  在 %USERPROFILE%\.pi\agent\extensions\dts.ts 生成 loader:
  loader 从 pi 内置的 typebox 包取 Type,注入仓库内的 createDtsPiExtension 工厂,
  由工厂注册 7 个 dts_* 工具 + /dts 命令,并把 RULES.md 注入 system prompt。

  用法:
    powershell -ExecutionPolicy Bypass -File .\install-pi.ps1
#>
$ErrorActionPreference = "Stop"

$extDir = if ($env:PI_EXTENSIONS_DIR) { $env:PI_EXTENSIONS_DIR } else { Join-Path $env:USERPROFILE ".pi\agent\extensions" }
$here = $PSScriptRoot

New-Item -ItemType Directory -Force -Path $extDir | Out-Null

function Write-Utf8NoBom {
  param(
    [Parameter(ValueFromPipeline = $true)][string]$Content,
    [string]$Path
  )
  [System.IO.File]::WriteAllText($Path, $Content, (New-Object System.Text.UTF8Encoding $false))
}

# JS import 路径统一用正斜杠(node/jiti 均接受)
$src = $here -replace "\\", "/"
$loader = @(
  'import { Type } from "typebox"'
  "import { createDtsPiExtension } from `"$src/pi.ts`""
  ""
  "export default function (pi) {"
  "  createDtsPiExtension({ pi, Type, rulesPath: `"$src/RULES.md`" })"
  "}"
) -join "`n"
$loaderPath = Join-Path $extDir "dts.ts"
Write-Utf8NoBom -Path $loaderPath -Content $loader
Write-Host "installed pi extension loader -> $loaderPath"
Write-Host "  (rules 注入 + 7 个 dts_* 工具 + /dts 命令,均由仓库源码 $src 提供,改源码即时生效)"

Write-Host ""
Write-Host "done. 新开 pi 会话即自动加载(全局扩展)。"
Write-Host "验证: pi --no-session -p `"列出你当前可用的 dts 工具名`""
Write-Host "卸载: Remove-Item `"$loaderPath`""
