# agent_plugins — 插件开发规则

本目录存放跨 agent 的插件。**每个新插件必须同时适配五端**：`opencode` / `pi` / `trae cn` / `reasonix` / `zcode`，缺一不可；只做其中几端的插件需在本文件末尾的"支持矩阵"登记缺失端与原因。

## 目录约定

```
agent_plugins/<name>/
├── core.ts              # agent 无关核心,零依赖,禁止 import 任何 agent 的包
├── RULES.md             # 唯一规则文本,各端按各自通道注入,不许各端抄一份
├── mcp/                 # (需要 MCP 的端共用)零依赖 stdio server,直接 import ../core.ts
├── <agent 专用目录>/     # reasonix/ zcode/ trae/ …:manifest + 该端独有文件 + 安装脚本
├── <agent> 适配层 .ts    # dts.ts(opencode) / pi.ts(pi) 等放插件根,与 core 同级
├── install*.sh/.ps1     # 每端一份安装脚本,幂等;放插件根或对应端子目录
└── README.md / INSTALL.md / SUMMARY.md
```

## 五端接入机制速查

| 端 | 自定义工具 | 规则注入 | 命令 | 接入形态 |
|----|-----------|---------|------|---------|
| opencode | 原生 plugin API(`tool` 工厂,loader 注入依赖) | 全局 `opencode.jsonc` 的 `instructions` | `commands/*.md` | 原生插件 |
| pi | 原生 extension `registerTool`(typebox 由 loader 注入;pi 无 MCP 客户端,扩展是唯一通道) | `before_agent_start` 追加到 system prompt | `registerCommand` | 原生扩展 |
| reasonix | **只能 MCP**(manifest `contributes.mcpServers`;插件包/代码扩展均不能注册工具) | `hooks.SessionStart` 钩子把 RULES.md 写到 stdout | manifest `contributes.commands` | 原生插件包(v2 manifest,内携 MCP) |
| trae cn | **只能 MCP**(UI 粘贴 mcpServers JSON) | 项目规则 `.trae/rules/project_rules.md` 合并规则块 | 无,靠规则引导 | MCP + 规则文件 |
| zcode | **只能 MCP**(插件 manifest 组件仅 commands/skills/hooks/mcpServers/agents) | 插件 `hooks` 的 SessionStart(config hooks 需 `enabled:true`,插件钩子自动生效) | `commands/*.md`(嵌套目录变 `/:` 前缀) | 原生插件(`.zcode-plugin/plugin.json`,可携 MCP) |

规律:**CLI 型且有插件/扩展 API 的端不需要 MCP;IDE 型(VS Code 系)与 reasonix 这类"声明式插件不含工具注册"的端必须走 MCP。** 写新插件时先按此表决定哪些端要接 `mcp/`。

## 硬性约定

- `core.ts` 与规则只有一份;适配层只做"机制翻译",不复制业务逻辑
- 依赖一律由各端 loader/manifest 注入,仓库源码保持零 npm 依赖、无构建步骤
- MCP server 纯 TS 直跑(Node ≥ 22.18 原生 type stripping 或 Bun),`launch.mjs` 负责选运行时;禁止把 core 编译产物或 JS 复制版提交进仓库
- 安装脚本幂等、支持 Windows(Git Bash + PowerShell 5.1)与 Linux/macOS;.ps1 含中文必须带 UTF-8 BOM;.sh 强制 LF
- 每端安装脚本自带验证命令;跨端共用的协议级验证(如 MCP selftest)放 `mcp/`
- manifest 路径引用不得逃逸插件根(reasonix 硬约束,zcode 习惯一致);跨端共用的脚本放插件根共享目录(如 `hooks/`),各端 manifest 用相对路径引用

## 支持矩阵

| 插件 | opencode | pi | trae cn | reasonix | zcode | 备注 |
|------|----------|----|---------|----------|-------|------|
| `dts` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
