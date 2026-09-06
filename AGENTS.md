# AGENTS.md — oh_my_friends

Personal OpenCode skill repository. Skills go in `skills/`, agent plugins in `agent_plugins/` (插件开发规则见 `agent_plugins/AGENTS.md`:每个插件必须支持 opencode / pi / trae cn / reasonix / zcode 五端).

## skill format

Each skill is a directory under `skills/` containing at minimum `SKILL.md` (YAML frontmatter + markdown). Optional subdirs: `references/` (docs), `evals/` (evaluation scenarios in `evals.json`).

- `name` in frontmatter must match the directory name
- `description` triggers skill selection — keep it precise
- Reference files live in `references/`, referenced by `SKILL.md` as needed

## current skills

| skill | description |
|-------|-------------|
| `terminal-beautify` | 跨平台终端美化与开发工具套件配置 (Windows/Linux/macOS) |
| `ai-skills-office` | 为 opencode / pi agent 挑选并安装实用技能（开发/测试/文案办公/设计/运维），含 DESIGN.md 前端设计规范流程 |
| `install-ai-devkit` | 从 GitHub 官方 release 安装 AI 开发工具套装（task / opencode / oh-my-pi / pi）到 ~/.local/bin 并配置 provider（deepseek / ollama / 阿里云 qwen / 自定义），提供 sh + bat 脚本 |

## current plugins

| plugin | description |
|--------|-------------|
| `dts` | agent 问题档案系统:用户提问自动建档到项目 `dts/`,记录日志/git版本/E2E用例/截图/修复方案,输出 markdown 供回顾学习;五端适配 (opencode loader / pi extension / reasonix plugin package / trae cn via MCP+rules / zcode plugin),共享 core.ts、hooks/session-rules.mjs 与 mcp/ stdio server |

## conventions

- No build system, package.json, tests, or CI — pure content repo
- Skills should be self-contained; cross-skill references avoided
- New skills go in `skills/<name>/` with a complete `SKILL.md`
- Plugins go in `agent_plugins/<name>/`: agent 无关的 `core` + 各 agent adapter;opencode 插件源码不得 import `@opencode-ai/plugin`(插件目录外会静默加载失败),依赖由 install.sh 生成的 loader 注入;需要 MCP 工具的 agent(reasonix / trae cn / zcode)共用 `mcp/` 下的零依赖 stdio server(纯 TS,Node ≥ 22.18 原生 type stripping 或 Bun 运行,launch.mjs 选运行时)
