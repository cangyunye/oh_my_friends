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

## conventions

- No build system, package.json, tests, or CI — pure content repo
- Skills should be self-contained; cross-skill references avoided
- New skills go in `skills/<name>/` with a complete `SKILL.md`
