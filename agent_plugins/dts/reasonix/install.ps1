#Requires -Version 5.1
<#
  dts reasonix 插件安装脚本 (Windows)

  等价于 reasonix/install.sh:用 reasonix plugin install --link 把 dts 目录
  (内含 reasonix-plugin.json)注册为 reasonix 插件。

  用法:
    powershell -ExecutionPolicy Bypass -File .\install.ps1
#>
$ErrorActionPreference = "Stop"

$here = $PSScriptRoot
$dtsHome = (Resolve-Path (Join-Path $here "..")).Path

$rx = Get-Command reasonix -ErrorAction SilentlyContinue
if ($null -eq $rx) {
  Write-Error "未找到 reasonix 命令,请先安装(https://github.com/esengine/DeepSeek-Reasonix)"
}

# 插件根 = dts 目录;--link 开发模式,源码改动即时生效
& reasonix plugin install $dtsHome --link --replace --yes

Write-Host ""
& reasonix plugin show dts
Write-Host ""
Write-Host "done. 验证:"
Write-Host "  reasonix plugin list           # 应出现 dts"
Write-Host "  reasonix plugin doctor dts     # 体检"
Write-Host "  在会话里输入 /:dts 回顾档案;排查问题时 agent 会调用 dts_* MCP 工具"
Write-Host "卸载: reasonix plugin remove dts"
