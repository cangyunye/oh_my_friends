# vendor/sync.ps1 - Refresh local backups of the must-have skills in vendor/
# Usage: powershell -ExecutionPolicy Bypass -File vendor/sync.ps1
# Notes: ai-skills-office installs must-have skills by copying from vendor/ first
#        (offline, version-locked). This script pulls latest versions from upstream.
$ErrorActionPreference = 'Stop'
$vendor = $PSScriptRoot
$tmp = Join-Path $env:TEMP 'ai-skills-office-sync'

function Sync-SingleFile([string]$Url, [string]$Dest) {
    New-Item -ItemType Directory -Force (Split-Path $Dest) | Out-Null
    curl.exe -fsSL $Url -o $Dest
    Write-Output "updated: $Dest"
}

function Sync-FromClone([string]$Repo, [string[]]$SkillPaths, [string[]]$Dests) {
    $src = Join-Path $tmp (Split-Path $Repo -Leaf)
    if (Test-Path $src) { Remove-Item -Recurse -Force $src }
    git clone --depth 1 --quiet "https://github.com/$Repo" $src
    for ($i = 0; $i -lt $SkillPaths.Count; $i++) {
        $s = Join-Path $src $SkillPaths[$i]
        $d = $Dests[$i]
        if (-not (Test-Path $s)) { throw "source path missing: $s - upstream may have moved, update this script" }
        if (Test-Path $d) { Remove-Item -Recurse -Force $d }
        Copy-Item -Recurse $s $d
        Write-Output "updated: $d"
    }
}

# 1) git-commit (github/awesome-copilot, single file)
Sync-SingleFile 'https://raw.githubusercontent.com/github/awesome-copilot/main/skills/git-commit/SKILL.md' `
    (Join-Path $vendor 'git-commit\SKILL.md')

# 2) skill-creator + 3) mcp-builder (anthropics/skills, one clone, two copies)
Sync-FromClone 'anthropics/skills' `
    @('skills/skill-creator', 'skills/mcp-builder') `
    @((Join-Path $vendor 'skill-creator'), (Join-Path $vendor 'mcp-builder'))

# 4) loop-me (mattpocock/skills, note: lives under skills/in-progress/)
# 5) handoff (mattpocock/skills, under skills/productivity/)
Sync-FromClone 'mattpocock/skills' `
    @('skills/in-progress/loop-me', 'skills/productivity/handoff') `
    @((Join-Path $vendor 'loop-me'), (Join-Path $vendor 'handoff'))

if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
Write-Output 'sync done: 5 must-have skills refreshed in vendor/'
