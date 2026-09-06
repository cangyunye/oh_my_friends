# dts 五端适配重构总结

> 2026-09-06。两轮:第一轮把 opencode 专用的 dts 问题档案插件重构为"共享核心 + 多端薄适配",新增 pi / reasonix / trae cn 三端;第二轮目录 `opencode_plugins/` 更名 `agent_plugins/`、建立五端开发规则(`agent_plugins/AGENTS.md`),并补齐第五端 zcode。

## 1. 交付物

```
agent_plugins/
├── AGENTS.md                # ★ 五端开发规则:新插件必须支持 opencode/pi/trae cn/reasonix/zcode
└── dts/
    ├── core.ts              # 共享核心(未改):建档/md 渲染/INDEX/截图,零依赖
    ├── RULES.md             # 唯一规则来源,五端按各自通道注入
    ├── hooks/session-rules.mjs  # ★ 共享 SessionStart 钩子(reasonix/zcode manifest 引用同一条)
    ├── dts.ts               # opencode 适配(未改)
    ├── pi.ts                # ★ pi 适配:createDtsPiExtension 工厂,零 pi 包依赖
    ├── install-pi.sh/.ps1/.bat  # ★ 生成 ~/.pi/agent/extensions/dts.ts loader
    ├── reasonix-plugin.json # ★ reasonix v2 manifest(apiVersion + contributes)
    ├── .zcode-plugin/plugin.json  # ★ zcode 插件 manifest(第二轮)
    ├── zcode/               # ★ hooks/hooks.json + commands/dts.md + README(第二轮)
    ├── reasonix/            # ★ /:dts 命令模板 + 安装脚本 + README
    ├── trae/                # ★ rules-dts.md 规则块 + 安装脚本(sh/ps1) + README
    ├── mcp/                 # ★ 零依赖 MCP stdio server(reasonix/trae/zcode 共用)
    │   ├── server.ts        #    直接 import ../core.ts,无逻辑复制
    │   ├── launch.mjs       #    运行时选择:node≥22.18 → bun → node --experimental-strip-types
    │   ├── package.json     #    {"type":"module"} 固定 ESM
    │   └── selftest.mjs     #    12 项协议+落盘自测
    └── README.md / INSTALL.md / SUMMARY.md(本文)
```

## 2. 各端实现机制对照

| | 工具注入 | 规则注入 | 回顾命令 | 安装产物 |
|--|---------|---------|---------|---------|
| opencode | plugin API `tool` 工厂,loader 注入依赖 | 全局 `opencode.jsonc` instructions | `/dts`(command-dts.md) | `~/.config/opencode/plugins/dts.ts` 等 |
| pi | `pi.registerTool` + typebox(`Type` 由 loader 注入) | 扩展内 `before_agent_start` 追加 RULES.md 到 system prompt(每轮重建,不累积) | `registerCommand("/dts")` + `getArgumentCompletions` | `~/.pi/agent/extensions/dts.ts` |
| reasonix | manifest `contributes.mcpServers`(stdio) | manifest `hooks.SessionStart` → 共享钩子脚本把 RULES.md 写到 stdout 注入上下文 | manifest `contributes.commands`(`/:dts`,`$ARGUMENTS` 模板) | `plugin-packages.json` 登记,`--link` 指向仓库 |
| trae cn | Trae UI 粘贴 mcpServers JSON(同一份 mcp/) | `.trae/rules/project_rules.md` 合并标记幂等的规则块 | 无命令机制,靠规则引导对话 | 无落盘(除规则块) |
| zcode | manifest `mcpServers`(stdio,`cwd` 锚定 `${ZCODE_PROJECT_DIR}`) | 插件 `hooks` 的 SessionStart(插件钩子自动启用 hook runner,共享 `hooks/session-rules.mjs`) | `commands/dts.md` → `/dts` | `.zcode-plugin/plugin.json` 经 UI 本地 marketplace 安装 |

设计不变量:工具语义五端一致(7 个 `dts_*`,参数同名同义);RULES.md 是唯一规则文本;core.ts 单一来源,任何端都不复制业务逻辑;跨端共用脚本放共享目录(`hooks/`、`mcp/`),manifest 用插件根内相对路径引用。

## 3. 验证结果

| 验证 | 方式 | 结果 |
|------|------|------|
| MCP server 协议与落盘 | `node mcp/selftest.mjs`(initialize/tools/list/tools/call 全流程) | 12/12 PASS |
| pi 适配全链路 | 临时探针扩展(真实 typebox 注入 → 注册断言 → execute 建档/列表/快照 → 规则注入断言),不烧 LLM 调用 | 7/7 PASS |
| reasonix manifest | `plugin install --dry-run` 校验 | `compatibility: full`,commands/hooks/mcp 全识别 |
| reasonix 安装 | `install.sh` 实装(--link)+ `plugin doctor dts` | ok(目录更名后已重装刷新链接) |
| trae 脚本 | 临时项目目录实测 ×2(合并正确、第二次幂等跳过、JSON 可解析、UTF-8 落盘) | 通过 |
| zcode manifest 依据 | 对照本机已装官方插件(android-emulator 等)的 manifest、hooks.json 与 zcode 主程序 bundle 内 `${ZCODE_PLUGIN_ROOT}`/`${ZCODE_PROJECT_DIR}`/hook schema(`type: command\|process` + argv)逆向确认 | 通过 |
| pi 真实 LLM 会话 | `pi -p` | **未完成**:本机 deepseek key 401 失效,与插件无关;换 key 后跑 `pi --no-session -p "列出你的 dts 工具"` 即可 |

## 4. 关键决策与踩坑

1. **loader 注入依赖,仓库源码零 import agent 包**:沿用 opencode 既有约定并推广到 pi——loader 位于 agent 的插件目录(能解析其内置包,如 pi 的 `typebox`),仓库内 `pi.ts` 只拿注入的 `Type`,和 `dts.ts` 不 import `@opencode-ai/plugin` 同理。
2. **MCP server 用 TS 直跑而不是复制 JS**:`core.ts` 全部是可擦除 TS 语法,Node ≥ 22.18 原生 type stripping 直接执行;`launch.mjs` 三级降级(node→bun→`--experimental-strip-types`)。代价是 MCP 通道要求新 Node/Bun,已写入前置条件。
3. **reasonix 只认 v2 manifest**:`plugin install --dry-run` 报 `missing apiVersion; native manifests must declare reasonix.io/plugin/v2`,v1 形态(name/version 顶层平铺)已废弃,必须 `apiVersion` + `contributes`。
4. **PS 5.1 无 BOM = GBK 误读**:含中文串的 .ps1 若无 UTF-8 BOM,写出内容即乱码。修复:规则文本外置 `trae/rules-dts.md` 单一来源 + 新写 .ps1 全部带 BOM。
5. **reasonix 命令模板不带 shell 展开**:opencode 的 `command-dts.md` 用 `` !`cat dts/INDEX.md` `` 注入索引,reasonix/zcode 模板不支持,改为指示 agent 用 read 工具读 `dts/INDEX.md`。
6. **MCP 通道没有会话 ID / 工作区上下文**:`sessionId` 取环境变量(REASONIX_SESSION_ID 等,可空),项目根按 `root` 参数 > `DTS_ROOT` > `REASONIX_WORKSPACE_ROOT` > cwd 链式解析;zcode 插件方式用 manifest `cwd: ${ZCODE_PROJECT_DIR}` 直接锚定工作区。
7. **目录更名的连锁反应**:pi loader 与 reasonix `--link` 内嵌仓库绝对路径,更名后必须重跑两个安装脚本刷新;git 索引旧路径要 `git add -A <旧路径>` 补记删除;reasonix-desktop 进程持有目录句柄会使 `git mv` 报 Permission denied,普通 `mv` 可绕过。
8. **zcode 钩子用 `type: "process"` 而非 shell 命令串**:bundle 内 hook schema 为 `{type: command|process, command, args?}`——process 形态走 argv 数组,跨平台免引号转义。

## 5. 哪些端必须走 MCP、不能做成插件

结论:**工具(而不是插件整体)是否必须走 MCP,取决于该 agent 有没有"注册自定义工具"的原生 API**。

| 端 | 有无原生工具注册 API | 结论 |
|----|---------------------|------|
| opencode | 有(plugin API 的 `tool`) | 不需要 MCP,原生插件直注(现状) |
| pi | 有(extension `registerTool`;且 pi 无内置 MCP 客户端,扩展是唯一通道) | 不需要 MCP,也不存在 MCP 备选 |
| reasonix | **没有**。声明式插件只贡献 skills/commands/prompts/hooks/mcpServers/themes;代码扩展(runtime sidecar)只做事件拦截与替换(改写输入、拦工具调用、换 system prompt 等),同样不注册新工具。官方文档明确工具来源是 MCP servers | **工具必须走 MCP**;但插件包本身有价值——规则钩子与命令是原生能力,形态是"插件包内声明携带 MCP server" |
| trae cn | **没有**。对 AI 暴露的扩展面只有:项目/全局规则、MCP、自定义智能体(UI 绑定提示词+MCP+内置工具) | **工具必须走 MCP**,且连规则注入也只是"文件约定"而非插件系统,是五端里插件能力最弱的 |
| zcode | **没有**。插件 manifest 组件仅 commands/skills/hooks/mcpServers/agents,无工具注册;但插件系统完整(marketplace、自动连接 MCP、插件钩子免 enabled 开关) | **工具必须走 MCP**;与 reasonix 同形态:"插件内声明携带 MCP server" |

推广规律:CLI 型、有插件/扩展 API 的 agent(opencode、pi、claude code 等)不需要 MCP 注册工具;IDE 型(VS Code 系 fork:Trae、Cursor、Windsurf 等)与声明式插件 agent(reasonix、zcode)没有工具注册 API,MCP 是工具的唯一通道——新插件里这些端直接复用 `mcp/` 这份 server。

## 6. 遗留事项

- pi:换有效 API key 后补跑真实会话验证
- zcode:manifest 依据逆向自本机已装插件与主程序 bundle,尚未经 UI 实装验证;首次本地 marketplace 安装时若 `mcpServers` 路径解析异常,改用 zcode/README 的"配置直写"方式兜底
- trae cn:可选产出"问题排查"自定义智能体配置说明(绑定 MCP + 规则)
- v1.5:opencode `tool.execute.after` / pi `tool_result` / reasonix+zcode `PostToolUse` 钩子自动捕获 bash 报错输出
