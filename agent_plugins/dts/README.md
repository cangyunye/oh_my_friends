# dts — agent 问题档案插件

把开发中遇到的每个问题建档为 `dts/<id>/dts.md`(问题 → 环境/git commit → 调查过程 → 日志 → E2E 用例 → 证据截图 → 修复方案 → 复盘),供日后回顾学习。

**五端适配**:同一份 agent 无关核心 `core.ts`,五个运行时各写一个薄适配层。

> 文档导航:逐端安装步骤与故障排查见 [INSTALL.md](INSTALL.md);架构决策、验证记录与"MCP 必要性分析"见 [SUMMARY.md](SUMMARY.md);本目录的开发规则(新插件必须支持五端)见 [../AGENTS.md](../AGENTS.md)。

## 架构

| 端 | 适配层 | 工具注入机制 | 规则注入 | 回顾命令 | 安装脚本 |
|----|--------|--------------|----------|----------|----------|
| opencode | [`dts.ts`](dts.ts) | opencode plugin API(`tool` helper,loader 注入) | 全局 `opencode.jsonc` 的 `instructions` 指向 RULES.md | `/dts`(command-dts.md) | `install.sh` / `install.ps1` / `install.bat` |
| pi | [`pi.ts`](pi.ts) | `pi.registerTool` + typebox(loader 注入 Type) | 扩展内 `before_agent_start` 追加 RULES.md 到 system prompt | `/dts`(`registerCommand`) | `install-pi.sh` / `install-pi.ps1` / `install-pi.bat` |
| reasonix | [`reasonix-plugin.json`](reasonix-plugin.json) + [`mcp/`](mcp/) | 原生插件包 `contributes.mcpServers`(MCP stdio) | 插件包 `hooks.SessionStart` 把 RULES.md 注入会话上下文 | `/:dts`(reasonix/commands) | [`reasonix/install.sh`](reasonix/install.sh) / `.ps1` |
| trae cn | [`trae/`](trae/) | Trae 设置 UI 添加 MCP server(同一份 `mcp/`) | 项目规则 `.trae/rules/project_rules.md` 合并 dts 规则块 | 对话里说"回顾 dts 档案" | [`trae/install.sh`](trae/install.sh) / `.ps1` |
| zcode | [`.zcode-plugin/plugin.json`](.zcode-plugin/plugin.json) + [`mcp/`](mcp/) | 插件 manifest `mcpServers`(MCP stdio,zcode 无工具注册 API) | 插件 `hooks` 的 SessionStart(共享 [`hooks/session-rules.mjs`](hooks/session-rules.mjs)) | `/dts`(zcode/commands) | 本地 marketplace / UI 添加,见 [zcode/README.md](zcode/README.md) |

### 共享核心

- [`core.ts`](core.ts) — 目录/文件结构、markdown 渲染、INDEX 维护、跨平台截图,零依赖。opencode/pi 直接 import;MCP(`mcp/server.ts`)经 Node ≥ 22.18 原生 type stripping(或 Bun)执行,**不复制逻辑**
- [`RULES.md`](RULES.md) — 建档规则,五端各自的注入通道如上表
- [`mcp/`](mcp/) — MCP stdio server(JSON-RPC 2.0,零 npm 依赖),reasonix / trae cn / zcode 共用;`launch.mjs` 自动选运行时(node ≥ 22.18 → bun → node `--experimental-strip-types`),`selftest.mjs` 为 12 项协议+落盘自测
- [`hooks/session-rules.mjs`](hooks/session-rules.mjs) — SessionStart 钩子脚本,reasonix 与 zcode 的 manifest 引用同一条

> **为什么用 loader + 工厂**:opencode 只让插件目录内的文件解析 `@opencode-ai/plugin`,仓库内文件直接 import 会静默加载失败;pi 侧同理,loader 负责从 pi 内置的 `typebox` 取依赖注入 `pi.ts`。仓库源码保持零依赖,改源码即时生效,无需重装。

## 安装

### opencode

```sh
./install.sh                                   # Linux / macOS / Git Bash
powershell -ExecutionPolicy Bypass -File .\install.ps1   # Windows(或双击 install.bat)
```

生成 `~/.config/opencode/plugins/dts.ts` loader;接 `/dts` 命令;把 RULES.md 写进全局 `opencode.jsonc` 的 `instructions`。重启 opencode 生效。

### pi

```sh
./install-pi.sh                                # Windows: .\install-pi.ps1 或双击 install-pi.bat
```

生成 `~/.pi/agent/extensions/dts.ts` loader(pi 全局扩展位,新会话自动加载)。规则注入与 `/dts` 命令都在扩展内完成。

### reasonix

```sh
reasonix/install.sh                            # Windows: .\reasonix\install.ps1
```

等价 `reasonix plugin install <dts目录> --link --replace --yes`,详见 [`reasonix/README.md`](reasonix/README.md)。

### trae cn

```sh
trae/install.sh /path/to/project               # Windows: .\trae\install.ps1 [-Project <项目>]
```

合并规则块进项目 `.trae/rules/project_rules.md`(标记幂等),打印即贴即用的 mcpServers JSON(贴到 Trae 设置 → MCP),详见 [`trae/README.md`](trae/README.md)。

### zcode

方式一(推荐,完整插件):ZCode 设置 → Plugin Management → Discover → `+` 添加本地目录本插件所在仓库,安装 `dts`;或直接把本目录作为本地 marketplace/插件目录添加。

方式二(直配):见 [`zcode/README.md`](zcode/README.md) 的配置直写说明。

> **行尾说明**:脚本在仓库内强制 LF(见根目录 `.gitattributes`),保证 Linux/macOS 直接可执行。若历史副本出现 `bad interpreter: /usr/bin/env bash^M`,先 `sed -i 's/\r$//' 对应 install*.sh` 再运行。新写的 `.ps1` 带 UTF-8 BOM(PS 5.1 无 BOM 会按 GBK 误读中文串)。

## 使用

- 自动:向 agent 报告问题/报错时,它会按规则立即 `dts_open` 建档,排查中追加日志/用例/截图,修复验证后 `dts_resolve` 结案
- 手动回顾:
  - opencode/pi/reasonix/zcode:`/dts`(全部)、`/dts open`(未解决)、`/dts feat-login`(按域)、`/dts <id>`(复盘某条)
  - trae cn:对话说"回顾 dts 档案 / 列出未解决的 dts"
- 五端工具语义一致,RULES.md 为唯一规则来源

## 截图矩阵

| 平台 | 方式 |
|------|------|
| macOS | `screencapture -x` 静默全屏(需"屏幕录制"权限;headless/SSH 环境会失败,工具自动提示改用 text 文本快照) |
| Windows | PowerShell `System.Drawing` 全屏 |
| Linux | `import` / `gnome-screenshot` / `scrot` 尽力而为 |
| 终端 | `dts_shot` 传 `text` → `.txt` 文本快照 |

## 卸载

| 端 | 操作 |
|----|------|
| opencode | 删 `~/.config/opencode/plugins/dts.ts`、`~/.config/opencode/commands/dts.md`,并从 `opencode.jsonc` 的 `instructions` 删掉 RULES.md 条目 |
| pi | 删 `~/.pi/agent/extensions/dts.ts` |
| reasonix | `reasonix plugin remove dts` |
| trae cn | Trae 设置 → MCP 移除 `dts`;删项目规则中 `<!-- dts-plugin:begin -->` 至 `<!-- dts-plugin:end -->` 块 |
| zcode | 设置 → Plugin Management 卸载 `dts`(直配方式则删 `~/.zcode/cli/config.json` 的 `mcp.servers.dts` 与 `~/.zcode/commands/dts.md`) |

## 验证

```sh
node mcp/selftest.mjs                 # MCP server 协议与落盘(12 项)
reasonix plugin doctor dts            # reasonix 插件体检
pi --no-session -p "列出你的 dts 工具"  # pi 真实会话(需有效 API key)
```

## roadmap

- v1.5:`tool.execute.after`(opencode)/ `tool_result`(pi)/ `PostToolUse`(reasonix、zcode)钩子自动捕获 bash 报错输出
- trae cn:出一份"问题排查"自定义智能体配置说明(绑定 MCP + 规则)
