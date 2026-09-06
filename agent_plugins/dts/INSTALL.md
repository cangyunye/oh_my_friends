# dts 五端安装文档

五个 agent(opencode / pi / reasonix / trae cn / zcode)共用一份 core 与规则,安装互不影响,可任选组合。

## 0. 前置条件

| 端 | 需要 | 检查命令 |
|----|------|----------|
| 全部(MCP 路线:reasonix / trae cn / zcode) | Node ≥ 22.18(原生执行 TS)或 Bun 任一 | `node --version` / `bun --version` |
| opencode | opencode CLI | `opencode --version` |
| pi | pi CLI(无 MCP 客户端,走原生扩展) | `pi --version` |
| reasonix | reasonix CLI ≥ 支持 `plugin` 子命令 | `reasonix plugin list` |
| trae cn | Trae CN 桌面版(MCP 与智能体在 UI 配置) | — |
| zcode | ZCode 客户端(插件经 UI 安装,支持本地目录来源) | — |
| 截图(可选) | macOS 屏幕录制权限 / Linux `import`\|`gnome-screenshot`\|`scrot` | 失败可改用 `dts_shot` 的 `text` 文本快照 |

> 所有安装脚本都是幂等的,重复运行安全;仓库内脚本强制 LF,Windows 用 Git Bash 运行 `.sh` 没问题,也可以用 `.ps1`。

## 1. opencode(原生插件)

```sh
# Linux / macOS / Git Bash
./install.sh

# Windows PowerShell(或双击 install.bat)
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

脚本做三件事:

1. 生成 loader `~/.config/opencode/plugins/dts.ts`(Windows: `%USERPROFILE%\.config\opencode\plugins\dts.ts`)
2. 接 `/dts` 命令到 `~/.config/opencode/commands/dts.md`(优先 symlink,失败退化复制)
3. 把 RULES.md 绝对路径写入全局 `opencode.jsonc` 的 `instructions`(JSONC 兼容,幂等)

环境变量 `OPENCODE_CONFIG_DIR` 可覆盖配置目录。

**验证**:重启 opencode 后,任意项目里问"列出你的 dts 工具",应出现 `dts_open` 等 7 个工具。

**卸载**:删上述 loader 与命令文件,并从 `opencode.jsonc` 的 `instructions` 删掉 RULES.md 条目。

## 2. pi(原生扩展)

```sh
./install-pi.sh

# Windows PowerShell(或双击 install-pi.bat)
powershell -ExecutionPolicy Bypass -File .\install-pi.ps1
```

只做一件事:生成全局扩展 `~/.pi/agent/extensions/dts.ts`,由它注入 typebox 的 `Type` 与 RULES.md 路径;工具注册、`/dts` 命令、system prompt 规则注入都在仓库 `pi.ts` 内完成。环境变量 `PI_EXTENSIONS_DIR` 可覆盖扩展目录。

**验证**(需有效 API key;pi 无 MCP,扩展是唯一工具注入通道):

```sh
pi --no-session -p "不要调用工具,只列出你名字以 dts_ 开头的工具"
```

**卸载**:`rm ~/.pi/agent/extensions/dts.ts`

## 3. reasonix(原生插件包,MCP 承载工具)

```sh
reasonix/install.sh

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File .\reasonix\install.ps1
```

等价于 `reasonix plugin install <dts目录> --link --replace --yes`。`--link` 是开发模式:插件直接引用仓库源码,改 `core.ts` / `RULES.md` 即时生效,无需重装。安装内容:

- `mcpServers.dts` — 7 个 `dts_*` 工具(经 `mcp/launch.mjs` 选 node/bun 运行时)
- `hooks.SessionStart` — 会话启动时把 RULES.md 注入上下文(共享钩子 `hooks/session-rules.mjs`)
- `commands` — `/:dts [list|open|<domain>|<id>]` 回顾命令

**验证**:

```sh
reasonix plugin list           # 应出现 dts
reasonix plugin doctor dts     # ok: dts
reasonix plugin show dts       # 查看解析后的 commands/hooks/mcpServers
```

**卸载**:`reasonix plugin remove dts`

## 4. trae cn(MCP + 项目规则,UI 完成)

Trae CN 没有插件 API,分两步:

```sh
# 在仓库的 dts 目录执行,传入目标项目路径(默认当前目录)
trae/install.sh /path/to/project

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File .\trae\install.ps1 -Project C:\path\to\project
```

1. 脚本自动把 dts 规则块(标记 `<!-- dts-plugin:begin -->` 包裹,幂等)合并进项目 `.trae/rules/project_rules.md`
2. 脚本打印即贴即用的 JSON → 打开 Trae CN:头像 → 设置 → MCP → 添加 MCP Server → 粘贴 JSON → 确认;工具列表应出现 7 个 `dts_*`

可选:对话框右上角设置 → 智能体,新建"问题排查"智能体,勾选 dts MCP(内置 Agent 会自动加载全部 MCP,可跳过)。

**验证**:对 Trae 说"npm test 挂了帮我看看",它应先调 `dts_open`,项目根出现 `dts/<id>/dts.md`。

**卸载**:Trae 设置 → MCP 移除 `dts`;删项目规则中 begin/end 标记之间的块。

## 5. zcode(用户级直配,已实测;插件形态见 zcode/README.md)

**方式一(推荐,本机已按此安装)**——三个官方文档声明的作用域文件:

1. MCP:`~/.zcode/cli/config.json` 的 `mcp.servers`(zcode 是嵌套 `mcp.servers`,非顶层 `mcpServers`):`{"dts": {"command": "node", "args": ["<绝对路径>/agent_plugins/dts/mcp/launch.mjs"]}}`
2. 命令:复制 `zcode/commands/dts.md` → `~/.zcode/commands/dts.md`;验证 `zcode commands list` 出现 `/dts`
3. 规则:RULES.md 内容(标记段)合并进 `~/.zcode/AGENTS.md`(用户级指令;配置文件的钩子需 `hooks.enabled: true` 才运行,故不走钩子)

**方式二(插件形态)**:ZCode 设置 → 插件管理 → 发现 → `+` 添加本地目录 `agent_plugins/` → 安装 `dts`。注意:`zcode plugins list` 只枚举官方层插件,第三方 marketplace 安装结果以 UI 面板为准(详见 [`zcode/README.md`](zcode/README.md) 实测备注)。

**验证**:新会话问"列出你的 dts 工具";说"npm test 挂了帮我看看",工作区根出现 `dts/<id>/dts.md`。

**卸载**:删 `mcp.servers.dts`、`~/.zcode/commands/dts.md`、`~/.zcode/AGENTS.md` 标记段;插件形态则在 UI 移除。

## 6. 全局自测(不依赖任何 agent)

```sh
node mcp/selftest.mjs
```

拉起真实 MCP server 走 initialize → tools/list → tools/call(建档/日志/快照/结案/列表)全流程,12 项断言,临时产物自动清理。

## 故障排查

| 现象 | 原因与处理 |
|------|------------|
| pi/opencode 验证 401 | agent 的模型 API key 失效,与插件无关;换 key 后重试 |
| `bad interpreter: /usr/bin/env bash^M` | 历史副本 CRLF 行尾,`sed -i 's/\r$//' 对应 install*.sh` |
| PowerShell 脚本中文乱码 | 本仓库新 .ps1 已带 UTF-8 BOM;自行改动时保持 BOM |
| MCP server 启动失败提示"运行时过旧" | Node < 22.18 且无 Bun;装 Node 22.18+ 或 Bun 任一 |
| 档案落错目录 | MCP 通道按 `root` 参数 > `DTS_ROOT` > `REASONIX_WORKSPACE_ROOT` > cwd 解析项目根;zcode 插件方式 cwd 固定为 `${ZCODE_PROJECT_DIR}`,必要时在工具调用里显式传 `root` |
| reasonix 安装报 missing apiVersion | manifest 必须是 `apiVersion: "reasonix.io/plugin/v2"` + `contributes` 形式(v1 已废弃) |
| 移动/重命名本仓库后档案建到旧路径 | pi loader 与 reasonix `--link` 里嵌的是绝对路径,重跑对应安装脚本即可刷新 |
