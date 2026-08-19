# dts — agent 问题档案插件

把开发中遇到的每个问题建档为 `dts/<domain_slug>/dts.md`(问题 → 环境/git commit → 调查过程 → 日志 → E2E 用例 → 证据截图 → 修复方案 → 复盘),供日后回顾学习。

当前为 **opencode 适配版**;核心 `core.ts` 与 agent 无关,pi agent 版本只需再写一个 adapter。

## 组成

| 文件 | 作用 |
|------|------|
| `core.ts` | agent 无关核心:目录/文件结构、markdown 渲染、INDEX 维护、跨平台截图(零依赖) |
| `dts.ts` | opencode 适配层:`createDtsPlugin(tool)` 工厂,注册 `dts_open/dts_log/dts_case/dts_evidence/dts_shot/dts_resolve/dts_list` |
| `RULES.md` | 记录规则,通过全局 `instructions` 注入 agent 上下文 |
| `command-dts.md` | `/dts` 命令:列表 / 未解决 / 按域或 id 回顾 |
| `install.sh` | 安装(幂等,Linux/macOS;`bash` + `python3`/`python`/`node` 任一即可) |
| `install.ps1` / `install.bat` | 安装(幂等,Windows;PowerShell 5.1+ 自带) |

## 安装

Linux / macOS:

```sh
./install.sh
```

Windows(PowerShell 或双击 `install.bat`):

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

两者做了同样三件事:
1. 在 `~/.config/opencode/plugins/dts.ts`(Windows:`%USERPROFILE%\.config\opencode\plugins\dts.ts`)生成 loader:由 loader 导入 `@opencode-ai/plugin` 并把 `tool` 注入本仓库的 `createDtsPlugin` 工厂
2. `command-dts.md` → `~/.config/opencode/commands/dts.md`:优先 symlink,权限不足(Windows 未开开发者模式等)自动退化为复制
3. 把 `RULES.md` 绝对路径写入全局 `opencode.jsonc` / `opencode.json` 的 `instructions`(JSONC 兼容,容忍注释/尾逗号;重复运行不重复添加)

重启 opencode 生效。

> **行尾说明**:脚本在仓库内强制 LF(见根目录 `.gitattributes`),保证 Linux/macOS 直接可执行。若你在 Windows 上克隆的历史副本出现 `bad interpreter: /usr/bin/env bash^M` 报错,先 `dos2unix opencode_plugins/dts/install.sh`(或 `sed -i 's/\r$//' opencode_plugins/dts/install.sh`)再运行。

> **为什么用 loader + 工厂**:opencode 只让插件目录内的文件解析 `@opencode-ai/plugin`,仓库内文件直接 import 会静默加载失败。loader 负责导入依赖,仓库源码保持零依赖(pi 版本可直接复用 `core.ts`/`dts.ts`)。改源码即时生效,无需重装。

## 使用

- 自动:向 agent 报告问题/报错时,它会按 RULES 自动 `dts_open` 建档,排查中追加日志/用例/截图,修复验证后结案
- 手动:`/dts`(全部)、`/dts open`(未解决)、`/dts feat-login`(按域)、`/dts <id>`(复盘某条)

## 截图矩阵

| 平台 | 方式 |
|------|------|
| macOS | `screencapture -x` 静默全屏(需"屏幕录制"权限;headless/SSH 环境会失败,工具自动提示改用 text 文本快照) |
| Windows | PowerShell `System.Drawing` 全屏 |
| Linux | `import` / `gnome-screenshot` / `scrot` 尽力而为 |
| 终端 | `dts_shot` 传 `text` → `.txt` 文本快照 |

## 卸载

```sh
rm ~/.config/opencode/plugins/dts.ts ~/.config/opencode/commands/dts.md
# 并从 ~/.config/opencode/opencode.jsonc 的 instructions 中删掉 RULES.md 条目
```

Windows 对应 `%USERPROFILE%\.config\opencode\` 下同样三个位置。

## roadmap

- v1.5:`tool.execute.after` hook 自动捕获 bash 报错输出
- pi agent adapter(复用 core.ts)
