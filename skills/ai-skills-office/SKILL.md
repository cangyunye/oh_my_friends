---
name: ai-skills-office
description: >-
  Use when 用户需要为 opencode / pi / omp（oh-my-pi）安装技能（skill）、想要实用技能清单、
  需要按开发/测试/文案办公/设计/运维分类挑选推荐技能，或需要为前端项目生成
  DESIGN.md 设计规范。触发词：装技能、安装 skill、技能推荐、有什么好用的技能、
  给我装几个技能、做个好看的前端/按某风格设计。
---

# ai-skills-office — 为 opencode / pi / omp（oh-my-pi）挑选与安装技能

## 激活

技能被触发时，先输出：

> 📦 **ai-skills-office 技能已激活** — 我来帮你挑选并安装实用技能（opencode / pi / omp）。

然后按下方工作流执行。

## 铁律（违反 = 失败）

1. **只推荐 `references/skill-catalog.md` 中预研过的技能。** 目录里没有的，如实告知用户；绝不现场编造技能名、来源仓库或安装命令。
2. **禁止在运行时上网搜集技能清单。** 目录已预研好。仅在用户明确要求「更新/查找新技能」时，经用户许可后才可联网。
3. **每个环节先确认再执行**：确认系统 → 确认清单 → 确认安装范围 → 确认安装动作。
4. **与用户用中文交流**；技能清单必须用 markdown 表格展示，使用场景用中文描述。
5. **`evals/` 目录仅用于评测，不代表工作流要求。** 一切行为以本文件与 `references/skill-catalog.md` 为准。

## 工作流（REQUIRED，按顺序执行，不可跳过）

1. **确认系统与架构** — 检测并告知用户 OS 与架构：
   - Windows：`$env:OS` + `$env:PROCESSOR_ARCHITECTURE`
   - Linux/macOS：`uname -s` + `uname -m`（x86_64 / aarch64 / arm64）
2. **检测 opencode / pi / omp（oh-my-pi）** — `Get-Command opencode, pi, omp`（Unix：`command -v opencode pi omp`），报告哪些已安装、哪些缺失。都没装 → 询问用户：先安装 opencode / pi(omp)，还是仅生成安装脚本备用。
3. **展示技能清单** — 按用户角色/需求从 `references/skill-catalog.md` 过滤，用 markdown 表格展示（技能 | 来源 | 中文使用场景 | 分类）。**清单必须始终包含「通用必装」小节列出的技能（目前：git-commit、skill-creator、loop-me、mcp-builder、handoff），与用户角色无关**；**若清单中出现「依赖必装」任一组的任意技能，必须同步包含该组其余技能（目前 grilling 组：grill-with-docs、grilling、domain-modeling）**；开发/测试用户再给「默认推荐」。等用户确认选择后再继续。
4. **询问安装范围** — 全局 or 项目内（具体路径/命令见「安装路径速查」）。
5. **执行安装** — 按目录中该技能的安装命令执行。**通用必装 4 项优先从本仓库 `vendor/<name>/` 复制**（备份优先：离线、版本锁定），`vendor/` 缺失或用户要求最新版时回退在线下载（命令见目录）；角色推荐技能按目录在线安装（opencode：拷贝 skill 目录 / `npx skills add` / plugin；pi：`pi install`；omp：`omp install` 或拷贝目录）。每个安装动作前确认。
6. **验证并汇报** — opencode 检查技能目录已存在并列出；pi/omp 检查技能目录存在（omp 可用 `omp --skills=<name>` 过滤确认）。向用户报告安装结果与使用方式。
7. **前端设计需求 → 走「DESIGN.md 工作流」** — 用户提到设计、风格、UI、页面外观时，在第 3 步确认清单后必须进入该流程。

## 通用必装（任何角色都必须包含在清单中）

> **备份优先**：4 项均有本仓库 `vendor/` 本地备份，安装时**优先复制 `vendor/<name>/`**（离线、版本锁定）；缺失或需最新时回退在线下载。刷新备份：`powershell -ExecutionPolicy Bypass -File vendor/sync.ps1`。

| 技能 | 来源 | 中文场景 |
|---|---|---|
| git-commit | github/awesome-copilot | 按 Conventional Commits 规范提交代码：自动识别 type/scope、智能暂存、防止提交密钥 |
| skill-creator | anthropics/skills | 引导创建符合标准的自有技能，任何角色沉淀方法论 |
| loop-me | mattpocock/skills（skills/in-progress/） | 交付不达标时自动循环迭代，直到用户满意 |
| mcp-builder | anthropics/skills | 构建/调试 MCP server，给 agent 接外部服务/工具 |
| handoff | mattpocock/skills（productivity/） | 把当前会话压缩成交接文档，换 agent/换会话无损续接 |

默认**全局**安装，除非用户指定项目内。安装命令见 `references/skill-catalog.md`「通用必装」。

## 默认推荐（用户未指定分类时）

- **开发**：brainstorming、code-review、grill-with-docs、handoff、implement、loop-me、skill-creator、subagent-driven-development、tdd、writing-plans、executing-plans、mcp-builder
- **测试**：brainstorming、qa-skills、writing-skills、grill-with-docs、teach、docx、xlsx

每个技能对应的来源仓库与安装命令见 `references/skill-catalog.md`「默认推荐映射」。

## 安装路径速查

| 运行时 | 全局 | 项目级 | 说明 |
|---|---|---|---|
| opencode | `~/.config/opencode/skills/<name>/` | `<项目>/.opencode/skills/<name>/` | 拷贝 SKILL.md 目录即安装；插件类技能用 `opencode.json` 的 `plugin` 数组 |
| pi | `pi install <来源>` | `pi install -l <来源>` | 也可手动放入 `~/.pi/agent/skills/` / `.pi/skills/` |
| omp（oh-my-pi） | `omp install <target>` 或拷贝到 `~/.pi/agent/skills/` | `omp install --scope=project` 或 `.pi/skills/` | 技能目录与 pi 兼容；`--scope=user`（默认）/`--scope=project` |

## DESIGN.md 工作流

用户需要前端设计/风格时（如「做个好看的页面」「按某产品的风格设计」）：

1. 询问三件事：**目标风格**（从 `awesome-design-md` 风格清单选，或用户指定参考产品）、**面向对象**、**使用场景**。
2. 获取对应 `DESIGN.md`：整库 clone `VoltAgent/awesome-design-md`，或只取 `design-md/<风格>/DESIGN.md`。
3. 将 `DESIGN.md` 放到**项目根目录**。
4. 修改项目 `AGENTS.md`：加入指示——代理做前端时必须读取项目根目录的 `DESIGN.md` 并严格遵循其中的设计 token（配色、字体、组件、响应式、间距）。
5. 告知用户：之后让 AI「按这个设计生成页面」即可，无需再手动描述风格。

## 常见错误

| 错误 | 修正 |
|---|---|
| 编造目录里不存在的技能 | 目录没有就直说，询问是否要联网查或由用户提供 |
| 跳过系统确认 / 全局-项目询问 | 这两个问题必问，赶时间也要问（可合并成一次提问） |
| 把技能装到错误运行时（如 `~/.claude/skills`） | 严格按「安装路径速查」使用 opencode / pi / omp 的路径 |
| 把 omp 当 pi 处理（忽略 `omp install` 与 `--scope`） | omp 用 `omp install <target>`（`--scope=user`/`--scope=project`）或拷贝到 `~/.pi/agent/skills/`；验证用 `omp --skills=` |
| 用户提到设计却只推技能、不走 DESIGN.md 流程 | 只要涉及前端风格/UI 就必须进入 DESIGN.md 工作流 |
| 推荐了技能却不给安装命令 | 每项推荐必须带具体安装方式（见目录） |
| 遗漏「通用必装」技能（git-commit、skill-creator、loop-me、mcp-builder、handoff） | 每次清单必须包含全部 5 项通用必装，与角色无关 |
| 只装 grill-with-docs 却漏掉 grilling、domain-modeling | 三者是依赖组（grill-with-docs 运行时调用后两者），出现任一必须整组安装，见目录「依赖必装」 |
| 自行给其他技能标注"人人必备" | 通用必装只以目录「通用必装」小节为准，不得现场发挥 |

## Red Flags — 停下检查

- 想「自己造一个类似的技能」而不是用目录里的 → 回到目录
- 想「先随便装个路径试试」→ 停止，查「安装路径速查」
- 用户说「赶时间别问太多」→ 仍须确认系统 + 安装范围，仅省略寒暄
- 想「先上网搜一下有什么技能」→ 目录已预研，联网需用户许可
- 想「自己判断哪些技能是人人必备」→ 通用必装只认目录「通用必装」小节（目前 5 项：git-commit、skill-creator、loop-me、mcp-builder、handoff）
- 想「只要 grill-with-docs 一个，其他不需要」→ 它是依赖组（grilling、domain-modeling）成员，必须整组安装
