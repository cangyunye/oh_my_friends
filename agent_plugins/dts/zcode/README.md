# dts — zcode 插件

zcode(本仓库插件规则中的第五端)有原生插件系统:`.zcode-plugin/plugin.json` manifest,可声明式贡献 `commands / skills / hooks / mcpServers / agents`——**没有自定义工具注册 API**,所以 7 个 `dts_*` 工具经 MCP stdio server 提供(复用共享实现 [`../mcp/`](../mcp/))。

## 两种安装方式

### 方式一(推荐,已实测):用户级直配

zcode CLI(`node <ZCode>/resources/glm/zcode.cjs` 或桌面端)的插件安装目前只能走 UI 的 marketplace 流程;不经 marketplace 的等效直配全部使用官方文档声明的作用域文件,本机已按此方式安装:

1. **MCP**:`~/.zcode/cli/config.json` 的 `mcp.servers`(注意 zcode 是嵌套 `mcp.servers`,不是顶层 `mcpServers`):

```json
{
  "mcp": {
    "servers": {
      "dts": {
        "command": "node",
        "args": ["<仓库绝对路径>/agent_plugins/dts/mcp/launch.mjs"]
      }
    }
  }
}
```

2. **命令**:复制 [`zcode/commands/dts.md`](commands/dts.md) 到 `~/.zcode/commands/dts.md`(用户级),验证:`zcode commands list` 应出现 `/dts`
3. **规则**:合并 [`hooks/session-rules.mjs`](../hooks/session-rules.mjs) 输出的规则到 `~/.zcode/AGENTS.md`(用户级指令文件,用 `<!-- dts-plugin:begin/end -->` 标记段包裹,幂等)。配置文件里的 hooks 需要额外 `hooks.enabled: true` 才运行,故直配方式的规则注入走 AGENTS.md 而不是钩子

三个位置都是用户级(所有工作区生效);工作区级对应 `<repo>/.zcode/config.json`、`<repo>/.zcode/commands/`、`<repo>/AGENTS.md`。

### 方式二:插件 marketplace(UI)

插件包本体在本目录(仓库存放 `agent_plugins/marketplace.json` 清单 + `dts/.zcode-plugin/plugin.json`):

1. ZCode → 设置 → 插件管理 → 发现 → `+` → 添加本地目录,选择 `agent_plugins/`
2. 安装并启用 `dts`;MCP 的 `dts` server 自动连接,插件钩子(SessionStart 注入规则)自动生效(无需 `hooks.enabled`)

> 实测备注(2026-09-06):zcode CLI 的 `plugins list` 只枚举官方层插件(`official/<marketplace>` 前缀),第三方本地 marketplace 的插件不会出现在该命令输出中;手写 `cache/`+`known_marketplaces.json`+`enabledPlugins` 的登记方式也未被 CLI 认领——插件形态的最终确认以 UI 的"插件管理"面板为准。直配方式不受此影响。

## 验证与卸载

- 验证:新会话问"列出你的 dts 工具"(应见 7 个 `dts_*`,MCP 工具名形如 `dts__dts_open` 或 `mcp__dts__*`);说"npm test 挂了帮我看看",工作区根应出现 `dts/<id>/dts.md`;`/dts` 回顾档案
- 卸载(直配):删 `config.json` 的 `mcp.servers.dts`、`~/.zcode/commands/dts.md`、`~/.zcode/AGENTS.md` 的标记段
- 卸载(插件):设置 → 插件管理 移除 `dts`

MCP server 运行时要求:Node ≥ 22.18 或 Bun,见 [`../mcp/`](../mcp/)。
