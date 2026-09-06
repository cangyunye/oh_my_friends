# dts — reasonix 插件

reasonix(由配置和插件驱动的 coding agent)通过**原生插件包**接入 dts。插件根即 dts 目录(内含 [`../reasonix-plugin.json`](../reasonix-plugin.json),`apiVersion: reasonix.io/plugin/v2`),声明式贡献,无 sidecar 运行时,`compatibility: full`:

| 贡献 | 实现 | 作用 |
|------|------|------|
| `mcpServers.dts` | [`../mcp/launch.mjs`](../mcp/launch.mjs) → [`server.ts`](../mcp/server.ts) | 7 个 `dts_*` 工具(与 pi/opencode 同一份 core.ts) |
| `hooks.SessionStart` | [`hooks/session-rules.mjs`](hooks/session-rules.mjs) | 会话启动时把 RULES.md 输出到 stdout 注入上下文(等价 opencode 的全局 instructions) |
| `commands` | [`commands/dts.md`](commands/dts.md) | `/:dts [list\|open\|<domain>\|<id>]` 回顾命令(prompt 模板,`$ARGUMENTS` 替换) |

## 安装

```sh
reasonix/install.sh
```

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\reasonix\install.ps1
```

等价于 `reasonix plugin install <dts目录> --link --replace --yes`:`--link` 开发模式直接引用仓库源码,改 `core.ts`/`RULES.md` 即时生效,无需重装。

安装后:

- `reasonix plugin list` 应出现 `dts`
- `reasonix plugin doctor dts` 体检通过
- 会话里输入 `/:dts` 回顾档案;向 agent 报告问题时,它会按注入的规则调用 `dts_open` 建档

MCP server 运行时要求:Node ≥ 22.18(原生执行 TS)或 Bun,见 [`../mcp/`](../mcp/)。

## 卸载

```sh
reasonix plugin remove dts
```
