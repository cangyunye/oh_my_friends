# AGENTS.md — oh_my_friends

Personal OpenCode skill repository. Skills go in `skills/`, agent plugins in `opencode_plugins/`.

## skill format

Each skill is a directory under `skills/` containing at minimum `SKILL.md` (YAML frontmatter + markdown). Optional subdirs: `references/` (docs), `evals/` (evaluation scenarios in `evals.json`).

- `name` in frontmatter must match the directory name
- `description` triggers skill selection — keep it precise
- Reference files live in `references/`, referenced by `SKILL.md` as needed

## current skills

| skill | description |
|-------|-------------|
| `terminal-beautify` | 跨平台终端美化与开发工具套件配置 (Windows/Linux/macOS) |

## current plugins

| plugin | description |
|--------|-------------|
| `dts` | agent 问题档案系统:用户提问自动建档到项目 `dts/`,记录日志/git版本/E2E用例/截图/修复方案,输出 markdown 供回顾学习 (opencode 版,pi 版待做) |

## conventions

- No build system, package.json, tests, or CI — pure content repo
- Skills should be self-contained; cross-skill references avoided
- New skills go in `skills/<name>/` with a complete `SKILL.md`
- Plugins go in `opencode_plugins/<name>/`: agent 无关的 `core` + 各 agent adapter;opencode 插件源码不得 import `@opencode-ai/plugin`(插件目录外会静默加载失败),依赖由 install.sh 生成的 loader 注入
