# dts — Trae CN 适配

Trae CN(字节跳动的 VS Code 系 AI IDE)没有 TypeScript 插件 API,dts 通过两条官方机制接入:

1. **MCP Server**:提供 `dts_open / dts_log / dts_case / dts_evidence / dts_shot / dts_resolve / dts_list` 7 个工具,复用共享实现 [`../mcp/server.ts`](../mcp/server.ts)(经 [`launch.mjs`](../mcp/launch.mjs) 选择 node/bun 运行时,需 Node ≥ 22.18 或 Bun)
2. **项目规则** `.trae/rules/project_rules.md`:注入 dts 使用规则,让 AI 主动在排查问题时建档

## 安装

```sh
# 在目标项目根目录执行(默认当前目录,也可传路径)
trae/install.sh /path/to/project
```

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File trae\install.ps1 -Project C:\path\to\project
```

脚本做两件事:

1. 把 dts 规则块(标记 `<!-- dts-plugin:begin -->` 包裹,幂等)合并进项目的 `.trae/rules/project_rules.md`
2. 打印一份即贴即用的 `mcpServers` JSON

**贴 JSON 的位置**:Trae CN 头像 → 设置 → MCP → 添加 MCP Server → 粘贴 JSON → 确认。添加后工具列表应出现 7 个 `dts_*` 工具。

## 可选:绑定自定义智能体

Trae CN 支持自定义智能体(对话框右上角设置 → 智能体):新建一个「问题排查」智能体,提示词填"排查本项目问题时遵循 project_rules 中 dts 档案规则",并勾选 dts MCP。内置 Agent 会自动加载全部已配置 MCP,可不绑定直接用。

## 验证

对 Trae 说"npm test 挂了,帮我看看"→ 它应先调用 `dts_open`,项目根目录出现 `dts/<id>/dts.md`;说 `/dts` 或"回顾 dts 档案"应能读 `dts/INDEX.md` 汇总。

## 卸载

1. Trae 设置 → MCP → 移除 `dts`
2. 删除项目 `.trae/rules/project_rules.md` 中 `<!-- dts-plugin:begin v1 -->` 到 `<!-- dts-plugin:end -->` 之间的块
