#Requires -Version 5.1
<#
  dts trae cn 插件安装脚本 (Windows)

  等价于 install.sh:
    1. 把 rules-dts.md 规则块合并进 <项目>\.trae\rules\project_rules.md(标记幂等)
    2. 打印即贴即用的 mcpServers JSON(Trae:头像 → 设置 → MCP → 添加)

  用法:
    powershell -ExecutionPolicy Bypass -File .\install.ps1 [-Project <项目目录>]
    项目目录默认为当前目录。
#>
param(
  [string]$Project = (Get-Location).Path
)
$ErrorActionPreference = "Stop"

$here = $PSScriptRoot
$dtsHome = (Resolve-Path (Join-Path $here "..")).Path

# 规则文本单一来源 rules-dts.md(UTF-8),避免在脚本内嵌中文串被 PS5.1 按 GBK 误读
$rulesBlock = Get-Content -Raw -Encoding UTF8 (Join-Path $here "rules-dts.md")

function Write-Utf8NoBom {
  param(
    [Parameter(ValueFromPipeline = $true)][string]$Content,
    [string]$Path
  )
  [System.IO.File]::WriteAllText($Path, $Content, (New-Object System.Text.UTF8Encoding $false))
}

# 1. 项目规则:合并 dts 规则块(marker 幂等,可重复运行)
$rulesDir = Join-Path $Project ".trae\rules"
$rulesFile = Join-Path $rulesDir "project_rules.md"
New-Item -ItemType Directory -Force -Path $rulesDir | Out-Null

if ((Test-Path $rulesFile) -and ((Get-Content -Raw -Encoding UTF8 $rulesFile) -match "dts-plugin:begin")) {
  Write-Host "rules 已存在(检测到 dts-plugin:begin 标记),跳过: $rulesFile"
} else {
  $merged = if (Test-Path $rulesFile) { (Get-Content -Raw -Encoding UTF8 $rulesFile).TrimEnd() + "`n`n" + $rulesBlock.TrimEnd() + "`n" } else { $rulesBlock.TrimEnd() + "`n" }
  Write-Utf8NoBom -Path $rulesFile -Content $merged
  Write-Host "installed project rules   -> $rulesFile (dts 规则块已追加)"
}

# 2. MCP 配置:打印即贴即用 JSON(路径统一正斜杠)
$mcpHome = $dtsHome -replace "\\", "/"
Write-Host ""
Write-Host "在 Trae CN 中添加 MCP Server(头像 → 设置 → MCP → 添加),粘贴以下 JSON:"
Write-Host ""
Write-Host (@"
{
  "mcpServers": {
    "dts": {
      "command": "node",
      "args": ["$mcpHome/mcp/launch.mjs"]
    }
  }
}
"@)
Write-Host ""
Write-Host "done. 后续步骤见 README.md(自定义智能体绑定、验证、卸载)"
