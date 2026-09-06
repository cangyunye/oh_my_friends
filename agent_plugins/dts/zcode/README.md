# dts — zcode 插件

zcode(本仓库插件规则中的第五端)有原生插件系统:`.zcode-plugin/plugin.json` manifest,可声明式贡献 `commands / skills / hooks / mcpServers / agents`——**没有自定义工具注册 API**,所以 7 个 `dts_*` 工具经 manifest `mcpServers` 携带的 MCP stdio server 提供(复用共享实现 [`../mcp/`](../mcp/)),与 reasonix 同类:插件承载规则钩子与命令,工具走 MCP。

## 组件

| 组件 | 实现 | 作用 |
|------|------|------|
| `mcpServers.dts` | [`../mcp/launch.mjs`](../mcp/launch.mjs) → `server.ts`,`cwd` 设为 `${ZCODE_PROJECT_DIR}` | 7 个 `dts_*` 工具,档案直接落在当前工作区 |
| `hooks`(SessionStart) | [`zcode/hooks/hooks.json`](hooks/hooks.json) → 共享 [`../hooks/session-rules.mjs`](../hooks/session-rules.mjs) | 会话启动把 RULES.md 注入上下文(插件钩子自动启用 hook runner,无需 `hooks.enabled`) |
| `commands` | [`zcode/commands/dts.md`](commands/dts.md) | `/dts [list\|open\|<domain>\|<id>]` 回顾命令 |

## 安装

**方式一:本地 marketplace / 插件目录(UI)**

1. ZCode → 设置 → Plugin Management → Discover 标签 → 点 `+`
2. 添加来源选"本地目录",指向本仓库(或直接指向 `agent_plugins/dts`)
3. 在列表中安装并启用 `dts`

安装后 MCP 的 `dts` server 自动连接(所有作用域的 MCP 均默认信任自动连接),会话里应出现 7 个 `dts_*` 工具;`/dts` 命令可用。

**方式二:配置直写(不装插件,适合只想开 MCP)**

把以下内容并入 `~/.zcode/cli/config.json`(用户级,注意 zcode 用嵌套的 `mcp.servers` 而非顶层 `mcpServers`):

```json
{
  "mcp": {
    "servers": {
      "dts": {
        "command": "node",
        "args": ["<本目录绝对路径>/mcp/launch.mjs"]
      }
    }
  }
}
```

命令文件复制到 `~/.zcode/commands/dts.md`;规则可合并进 `~/.zcode/AGENTS.md`(用户级)或项目的 `AGENTS.md`。注意:配置文件里的 hooks 需要 `hooks.enabled: true` 才会运行,所以直配方式的规则注入推荐走 AGENTS.md 而不是钩子。

## 验证与卸载

- 验证:新会话问"列出你的 dts 工具";说"npm test 挂了帮我看看",工作区根应出现 `dts/<id>/dts.md`
- 卸载:设置 → Plugin Management 移除 `dts`;直配方式删除上面对应的 `mcp.servers.dts`、命令文件与规则段落

MCP server 运行时要求:Node ≥ 22.18 或 Bun,见 [`../mcp/`](../mcp/)。
