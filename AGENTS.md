# AGENTS.md — oh_my_friends

Personal OpenCode skill repository. Skills go in `skills/`.

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

## conventions

- No build system, package.json, tests, or CI — pure content repo
- Skills should be self-contained; cross-skill references avoided
- New skills go in `skills/<name>/` with a complete `SKILL.md`
