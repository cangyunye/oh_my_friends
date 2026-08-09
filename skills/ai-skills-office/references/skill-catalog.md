# ai-skills-office 技能目录（预研版）

> 本目录为预研结果（抓取时间 2026-08）。**运行时以本目录为准**：推荐技能、来源与安装命令一律来自这里，禁止现场编造，禁止运行时上网重新搜集（除非用户明确要求更新并经许可）。

## 分类速查

| 分类 | 代表性技能/来源 | 一句话场景 |
|---|---|---|
| 通用 | awesome-copilot(git-commit) | 规范 git 提交，任何角色必装 |
| 开发 | mattpocock/skills、obra/superpowers、archify、ponytail、open-code-review | 工程纪律、架构图、代码评审、少写代码 |
| 测试 | aresayu/qa-skills、mattpocock(tdd/qa)、anthropics(webapp-testing)、browser-use | 测试用例生成、TDD、网页自动化回归 |
| 文案办公 | anthropics(docx/xlsx/pptx/pdf)、dashi-ppt-skill | Word / Excel / PPT / PDF 文档 |
| 设计 | awesome-design-md、hallmark、anthropics(frontend-design) | 前端 UI 风格与设计规范 |
| 运维 | browser-use、Composio 自动化技能 | 网页监控、抓取、自动化任务 |

---

## 预研仓库清单

### 1. VoltAgent/awesome-design-md — 设计
- **是什么**：73+ 份知名网站（Stripe、Linear、Vercel、Apple、opencode.ai 等）的 `DESIGN.md` 设计系统文档合集。每份含：视觉主题、色板、排版、组件样式、布局、阴影层级、Do's & Don'ts、响应式、Agent Prompt Guide。
- **安装/使用**：无需安装。把 `design-md/<风格>/DESIGN.md` 复制到项目根目录，然后让 AI「按这个设计生成页面」。建议整库 clone：`git clone --depth 1 https://github.com/VoltAgent/awesome-design-md`。
- **中文场景**：想要页面风格像某知名产品？把对应 DESIGN.md 放进项目，AI 前端开发配色/字体/组件/响应式全有据可依。
- 完整风格清单见文末附录。

### 2. alibaba/open-code-review — 开发/测试
- **是什么**：阿里开源 AI 代码评审 CLI（`ocr`），读 git diff 交给 LLM 深度评审，行级精度，token 约为通用代理的 1/9。
- **安装**（opencode）：`npm install -g @alibaba-group/open-code-review` + `ocr config provider` 配置模型；opencode 插件：下载 `plugins/open-code-review/opencode/open-code-review.ts` 到 `~/.config/opencode/plugins/`。
- **中文场景**：PR/分支/commit 的代码审查，需要结构化、可行动的评审意见。

### 3. tt-a1i/archify — 开发
- **是什么**：把代码库/一句话描述生成带验证的交互式架构图（Architecture / Workflow / Sequence / Data Flow / Lifecycle，5 类图，4 种视觉预设）。
- **安装**：`npx skills add tt-a1i/archify -g`（写入 opencode/对应 agent 的 skills 目录）。用法：`Use archify to map this repository's runtime architecture.`
- **中文场景**：架构评审、时序讲解、CI/CD 流程图、README 架构卡片。

### 4. DietrichGebert/ponytail — 开发
- **是什么**：极简主义 skill（YAGNI 阶梯：能一行就一行），目标是少写代码、降 token 成本、提速。
- **安装**（opencode）：项目 `opencode.json` 加 `{ "plugin": ["@dietrichgebert/ponytail"] }`；或从本地 checkout 用 `{ "plugin": ["./.opencode/plugins/ponytail.mjs"] }`。
- **中文场景**：AI 老把简单需求写成一百行还拉一堆依赖？让它「能一行就一行」，保留安全/校验底线。

### 5. aresayu/qa-skills — 测试
- **是什么**：QA 测试用例生成技能集。包含 `webapp-testing`、`functional-testcase-generator`、`api-testcase-generator`、`automation-testcase-generator`、`performance-testcase-generator`、`doc-based-testcase-generator`、`pict-test-designer`、`prd-to-xmind-testcases`、`test-master` 等（无 README，无官方安装命令）。
- **安装**：`git clone --depth 1 https://github.com/aresayu/qa-skills`，把需要的技能目录拷贝到对应 skills 路径（opencode 全局 `~/.config/opencode/skills/<name>/`；pi `~/.pi/agent/skills/<name>/`）。`webapp-testing` 依赖 Python + Playwright。
- **中文场景**：把 PRD/需求文档丢给 AI，自动产出功能/接口/性能测试用例。

### 6. Nutlope/hallmark — 设计（注意：是 UI 设计，不是文案）
- **是什么**：反 AI 味（anti-AI-slop）的 UI 设计技能：挑宏观结构、套 21 套视觉主题、跑 57 项 slop-test 门禁。
- **安装**：`npx skills add nutlope/hallmark`。支持动词：默认新建 UI、`hallmark audit`、`hallmark redesign`、`hallmark study`。
- **中文场景**：受够了 AI 生成的千篇一律网页？用它做落地页/官网/品牌站，保持独特视觉指纹。

### 7. chuspeeism/dashi-ppt-skill — 文案办公/设计
- **是什么**：生成 PPT 的技能（大师 PPT）：网页版可编辑 PPT，一键导出 HTML 离线包 / PDF / 真实可编辑 PPTX。12 套主题、图表（雷达/瀑布/桑基/甘特）、分析模型（SWOT/波特五力/PEST/商业模式画布）。
- **安装**：`npx dashi-ppt-skill@latest`（国内：`npx --registry=https://registry.npmmirror.com dashi-ppt-skill@latest`）。需 Node 20+；导出 PPTX/PDF 需本机 Chrome/Chromium/Edge（可设 `CHROME_PATH`）。
- **中文场景**：行业研究、竞品分析、项目汇报、路演材料——几分钟出一份结构完整、还能继续改的 PPT。

### 8. browser-use/browser-use — 测试/运维/开发
- **是什么**：让 AI agent 像人一样操作浏览器的自动化工具（开页面、点按钮、填表单、抓数据、跑 QA）。
- **安装**：`uv add browser-use`（或 `pip install browser-use`，Python ≥3.11）后运行 `browser-use skill install` 注册成 skill；或直接把「Install browser-use with uv using Python 3.12, run `browser-use skill install`, and connect it to my browser.」丢给 agent 自助安装。
- **中文场景**：填表、下单、比价、抓数据导出 CSV、本地站点 QA 回归测试。

### 9. ComposioHQ/awesome-claude-skills — 全类（技能市场/索引）
- **是什么**：精选技能目录仓库（1000+ 生产级技能），子目录即技能（含 SKILL.md）。官方技能含 `mcp-builder`、`skill-creator`、`webapp-testing`、`document-skills`、`brand-guidelines`、`theme-factory`、`canvas-design` 等。
- **安装/使用**：按业务分类浏览 README → `git clone --depth 1 https://github.com/ComposioHQ/awesome-claude-skills` → 把选中技能目录拷贝到 skills 路径（与 opencode/pi 的 skills 目录兼容）。
- **中文场景**：想给 agent「加技能」时先来这里按分类淘现成技能，免去自己写 SKILL.md。

### 10. mattpocock/skills — 开发/测试
- **是什么**：真实工程师技能集（非 vibe coding）。含 `grill-with-docs`、`implement`、`tdd`、`code-review`、`handoff`、`teach`、`loop-me`、`triage`、`to-spec`、`diagnosing-bugs`、`research`、`wayfinder` 等。
- **安装**（非 Claude Code）：`npx skills@latest add mattpocock/skills`（可选装哪些技能、装到哪些 agent）。
- **中文场景**：让 agent 按工程纪律干活：先 grill 对齐需求 → 再 TDD → 再 code review，解决「agent 没听懂需求 / 代码质量不可控」。

### 11. anthropics/skills（官方）— 文案办公/开发/设计/测试
- **是什么**：Anthropic 官方技能集。含 `docx`、`xlsx`、`pptx`、`pdf`、`skill-creator`、`mcp-builder`、`frontend-design`、`webapp-testing`、`brand-guidelines`、`canvas-design`、`theme-factory`、`doc-coauthoring`、`web-artifacts-builder` 等。
- **安装**：`git clone --depth 1 https://github.com/anthropics/skills`，把需要的技能目录拷贝到 skills 路径。docx/xlsx/pptx 依赖 Python 包：`pip install python-docx python-openpyxl python-pptx`。
- **中文场景**：Word/Excel/PPT/PDF 文档读写、前端设计规范、创建技能、搭建 MCP server。

### 12. obra/superpowers — 开发/测试
- **是什么**：Jesse Vincent 的 superpowers 技能集。含 `brainstorming`、`subagent-driven-development`、`test-driven-development`、`writing-plans`、`executing-plans`、`writing-skills`、`systematic-debugging`、`requesting-code-review`、`verification-before-completion` 等。
- **安装**：opencode：`opencode.json` 的 `plugin` 数组加 `"superpowers@git+https://github.com/obra/superpowers.git"`（或 `npx skills add obra/superpowers`）；pi：`pi install git:github.com/obra/superpowers`。
- **中文场景**：写代码前的需求澄清（brainstorming）、TDD、计划拆分执行、技能编写等完整工程方法论。

### 13. github/awesome-copilot（GitHub 官方）— 通用/开发/测试
- **是什么**：GitHub 官方维护的超大 Agent 技能集合仓库（数百个技能，覆盖开发/测试/运维/文档等），质量有保障。
- **包含技能**：`git-commit`（本目录的通用必装技能，见下）、`webapp-testing`、`anti-ui-slop`、`update-llms`、`agent-skill-stack` 等数百个。
- **安装/使用**：整库 `git clone --depth 1 https://github.com/github/awesome-copilot` 后拷贝所需技能目录；单个技能（如 git-commit 仅含一个 SKILL.md）可直接 curl 下载，见下。
- **中文场景**：GitHub 官方基础技能，适合所有人。

---

## 通用必装（无论任何角色，每次清单都必须包含）

> **备份优先**：这 4 项在本仓库 `vendor/` 目录下有完整本地备份（版本锁定、离线可用）。安装时**优先从 `vendor/<name>/` 直接复制**到目标 skills 目录；`vendor/` 缺失或用户要求最新版时，才按下方命令在线获取。刷新备份：`powershell -ExecutionPolicy Bypass -File vendor/sync.ps1`。

| 技能 | 来源 | 安装方式 |
|---|---|---|
| git-commit | github/awesome-copilot | 复制 `vendor/git-commit/`（优先），见下 |
| skill-creator | anthropics/skills | 复制 `vendor/skill-creator/`（优先），见下 |
| loop-me | mattpocock/skills（skills/in-progress/） | 复制 `vendor/loop-me/`（优先），见下 |
| mcp-builder | anthropics/skills | 复制 `vendor/mcp-builder/`（优先），见下 |
| handoff | mattpocock/skills（productivity/） | 复制 `vendor/handoff/`（优先），见下 |

### git-commit（github/awesome-copilot）
- **是什么**：按 Conventional Commits 规范执行 git commit：自动分析 diff 识别 type/scope、智能暂存、生成规范提交信息；内置 Git 安全协议（不提交密钥、不强制 push、不跳过 hooks）。技能仅含一个 `SKILL.md` 文件。
- **安装（备份优先）**：把 `vendor/git-commit/` 整个目录复制到目标 skills 路径（opencode 全局 `~/.config/opencode/skills/git-commit`；pi/omp 全局 `~/.pi/agent/skills/git-commit`；项目级换对应路径）。
- **在线回退（单文件下载，仓库很大不必整库 clone）**：
  - opencode 全局（Windows）：
    ```powershell
    $dst = "$env:USERPROFILE\.config\opencode\skills\git-commit"
    New-Item -ItemType Directory -Force $dst | Out-Null
    curl.exe -fsSL https://raw.githubusercontent.com/github/awesome-copilot/main/skills/git-commit/SKILL.md -o "$dst\SKILL.md"
    ```
  - opencode 全局（Linux/macOS）：
    ```bash
    mkdir -p ~/.config/opencode/skills/git-commit
    curl -fsSL https://raw.githubusercontent.com/github/awesome-copilot/main/skills/git-commit/SKILL.md -o ~/.config/opencode/skills/git-commit/SKILL.md
    ```
  - pi / omp（全局）：
    ```bash
    mkdir -p ~/.pi/agent/skills/git-commit
    curl -fsSL https://raw.githubusercontent.com/github/awesome-copilot/main/skills/git-commit/SKILL.md -o ~/.pi/agent/skills/git-commit/SKILL.md
    ```
  - 项目级：把目标路径换成 `<项目>/.opencode/skills/git-commit/`、`<项目>/.pi/skills/git-commit/` 或 `<项目>/.agents/skills/git-commit/`。
- **中文场景**：任何人提交代码时都适用——提交信息规范化（feat/fix/docs/refactor…）、自动识别 scope、防止把密钥提交进仓库。
- **分类**：通用（任何角色）。

### skill-creator（anthropics/skills）
- **是什么**：引导创建符合 agentskills 标准的新技能（name/description frontmatter、目录结构、测试验证）。
- **安装（备份优先）**：把 `vendor/skill-creator/` 整个目录复制到目标 skills 路径。
- **在线回退**：`git clone --depth 1 https://github.com/anthropics/skills` 后拷贝 `skills/skill-creator` 到对应 skills 目录。
- **中文场景**：任何角色都可能要沉淀自己的技能——把可复用的方法固化成 SKILL.md。
- **分类**：通用（任何角色）。

### loop-me（mattpocock/skills，注意位于 skills/in-progress/ 下）
- **是什么**：让 agent 在交付不达标时自动继续循环迭代，直到用户满意为止。
- **安装（备份优先）**：把 `vendor/loop-me/` 整个目录复制到目标 skills 路径。
- **在线回退**：clone mattpocock/skills 后拷贝 `skills/in-progress/loop-me` 目录到对应 skills 路径（注意在 `in-progress/` 下，不是仓库根；交互式 `npx skills add` 可能不收录该目录）。
- **中文场景**：任何角色都受益——AI 交付质量不足时自动迭代，而不是交一次就完事。
- **分类**：通用（任何角色）。

### mcp-builder（anthropics/skills）
- **是什么**：构建/调试 MCP server 的官方技能（含 MCP 配置、工具注册、调试流程）。
- **安装（备份优先）**：把 `vendor/mcp-builder/` 整个目录复制到目标 skills 路径。
- **在线回退**：`git clone --depth 1 https://github.com/anthropics/skills` 后拷贝 `skills/mcp-builder` 到对应 skills 目录。
- **中文场景**：需要给 agent 接外部服务/工具（MCP）时，按官方步骤搭建与调试。
- **分类**：通用（任何角色）。

### handoff（mattpocock/skills，位于 skills/productivity/ 下）
- **是什么**：把当前会话压缩成结构化的交接文档（上下文、进度、待办），供另一个 agent 无缝继续。
- **安装（备份优先）**：把 `vendor/handoff/` 整个目录复制到目标 skills 路径。
- **在线回退**：clone mattpocock/skills 后拷贝 `skills/productivity/handoff` 目录到对应 skills 路径。
- **中文场景**：任何角色都可能交接工作——会议中途换 agent、会话过长换新会话、跨人协作，都能无损续接。
- **分类**：通用（任何角色）。

---

## 依赖必装（联动安装组：出现任一，必须同步包含其余）

> **规则**：清单中出现本组**任意一个**技能，就必须把整组都列入安装。理由：组内技能存在调用关系（grill-with-docs 的 SKILL.md 原文即要求 `Run a /grilling session, using the /domain-modeling skill.`），只装一个会导致运行时调用落空。

| 组 | 技能 | 来源 | 中文场景 |
|---|---|---|---|
| grilling 组 | grill-with-docs | mattpocock/skills（engineering/） | 动手前对照文档/PRD 质询用户，对齐需求 |
| | grilling | mattpocock/skills（productivity/） | 追问式需求澄清（design tree 轮询），被 grill-with-docs 调用 |
| | domain-modeling | mattpocock/skills（engineering/） | 维护 CONTEXT.md 领域语言与 ADR，被 grill-with-docs 调用 |

**安装**（三个一起装）：clone mattpocock/skills 后拷贝三个目录到目标 skills 路径（opencode 全局 `~/.config/opencode/skills/<name>`；pi/omp 全局 `~/.pi/agent/skills/<name>`）：

```powershell
# Windows / opencode 全局示例（Unix 把路径换成 ~/.config/opencode/skills）
git clone --depth 1 https://github.com/mattpocock/skills "$env:TEMP\mattpocock-skills"
$g = "$env:TEMP\mattpocock-skills\skills"
Copy-Item -Recurse "$g\engineering\grill-with-docs"  "$env:USERPROFILE\.config\opencode\skills\grill-with-docs"
Copy-Item -Recurse "$g\productivity\grilling"       "$env:USERPROFILE\.config\opencode\skills\grilling"
Copy-Item -Recurse "$g\engineering\domain-modeling" "$env:USERPROFILE\.config\opencode\skills\domain-modeling"
```

> 或 `npx skills@latest add mattpocock/skills` 交互勾选这 3 项。注意目录位置：`grill-with-docs`/`domain-modeling` 在 `engineering/` 下，`grilling` 在 `productivity/` 下。

---

## 默认推荐映射

### 开发（默认项）
| 技能 | 来源 | 安装方式 |
|---|---|---|
| brainstorming | obra/superpowers | opencode plugin / `npx skills add obra/superpowers` / `pi install git:github.com/obra/superpowers` |
| code-review | mattpocock/skills | `npx skills@latest add mattpocock/skills`（选 code-review） |
| grill-with-docs | mattpocock/skills | 同上（选 grill-with-docs）；**依赖必装：联动 grilling、domain-modeling** |
| handoff | mattpocock/skills | 复制 `vendor/handoff/`（备份优先）；在线回退见通用必装小节 |
| implement | mattpocock/skills | 同上（选 implement） |
| loop-me | mattpocock/skills（skills/in-progress/） | 复制 `vendor/loop-me/`（备份优先）；在线回退见通用必装小节 |
| skill-creator | anthropics/skills | 复制 `vendor/skill-creator/`（备份优先）；在线回退见通用必装小节 |
| subagent-driven-development | obra/superpowers | 同 brainstorming |
| tdd | mattpocock/skills | `npx skills@latest add mattpocock/skills`（选 tdd） |
| writing-plans | obra/superpowers | 同 brainstorming |
| executing-plans | obra/superpowers | 同 brainstorming |
| mcp-builder | anthropics/skills | 复制 `vendor/mcp-builder/`（备份优先）；在线回退见通用必装小节 |

### 测试（默认项）
| 技能 | 来源 | 安装方式 |
|---|---|---|
| brainstorming | obra/superpowers | 同上 |
| qa-skills | aresayu/qa-skills | clone aresayu/qa-skills，拷贝所需技能目录 |
| writing-skills | obra/superpowers | 同 brainstorming |
| grill-with-docs | mattpocock/skills | `npx skills@latest add mattpocock/skills`（选 grill-with-docs）；**依赖必装：联动 grilling、domain-modeling** |
| teach | mattpocock/skills | 同上（选 teach） |
| docx | anthropics/skills | clone anthropics/skills，拷贝 `skills/docx` |
| xlsx | anthropics/skills | clone anthropics/skills，拷贝 `skills/xlsx` |

---

## 安装机制附录

### opencode
- 每个技能 = 一个目录 + `SKILL.md`（YAML frontmatter 必含 `name`/`description`；`name` 必须与目录名一致）。
- 全局：`~/.config/opencode/skills/<name>/SKILL.md`（Windows：`%USERPROFILE%\.config\opencode\skills\`）；项目级：`<项目>/.opencode/skills/<name>/`（也识别 `.claude/skills`、`.agents/skills`）。
- 官方 CLI **没有** `opencode skill` 子命令。安装 = 拷贝目录 / `npx skills add <owner>/<repo>`（skills.sh，支持 opencode）/ 插件（`opencode.json` 的 `plugin` 数组）。
- 验证：新会话中 `skill` 工具应能列出；或检查目录存在。

### pi（@earendil-works/pi-coding-agent，官网 pi.dev）
- 包管理命令：`pi install <来源>`（npm/git/本地路径，`-l` 装为项目级）、`pi remove`、`pi list`、`pi update --all`、`pi config`。
- git 包示例：`pi install git:github.com/obra/superpowers`。
- 技能目录：全局 `~/.pi/agent/skills/`、`~/.agents/skills/`；项目级 `.pi/skills/`、`.agents/skills/`。
- 可导入其他工具的技能：`settings.json` 中 `"skills": ["~/.claude/skills", "~/.codex/skills"]`。

### oh-my-pi（omp，pi 的新版命令行，同一项目 @earendil-works/pi-coding-agent，官网 pi.dev）
- 命令为 `omp`（实测 v17.2.11）；技能按 agentskills 标准发现与加载，`SKILL.md` frontmatter 同规范。
- 技能相关参数：`--no-skills` 禁用发现；`--skills=<glob>` 过滤技能（如 `git-*,docker`）；另有 `-e/--extension` 加载扩展。
- 技能目录（与 pi 兼容）：全局 `~/.pi/agent/skills/`、`~/.agents/skills/`；项目级 `.pi/skills/`、`.agents/skills/`。
- 包/插件安装：`omp install <target>`（本地路径 / npm spec / marketplace ref；`--scope=user`（默认）或 `--scope=project`；`--dry-run` 预览、`--force`、`--json`），等价于 `omp plugin install`。
- 其他：`omp plugin` 管理插件、`omp agents` 管理子代理（`omp agents unpack` 导出到 `~/.omp/agent/agents`）、`omp setup`、`omp update`；`~/.omp/` 存放 natives 与 worktrees（`~/.omp/wt`）。
- 验证技能已装：检查对应 skills 目录文件存在，或用 `omp --skills=<name>` 过滤后在新会话中触发。

---

## 附录：awesome-design-md 风格清单（design-md/ 目录）

airbnb, airtable, apple, binance, bmw-m, bmw, bugatti, cal, claude, clay, clickhouse, cohere, coinbase, composio, cursor, dell-1996, elevenlabs, expo, ferrari, figma, framer, hashicorp, hp, ibm, intercom, kraken, lamborghini, linear.app, lovable, mastercard, meta, minimax, mintlify, miro, mistral.ai, mongodb, nike, nintendo-2001, notion, nvidia, ollama, opencode.ai, pinterest, playstation, posthog, raycast, renault, replicate, resend, revolut, runwayml, sanity, sentry, shopify, slack, spacex, spotify, starbucks, stripe, supabase, superhuman, tesla, theverge, together.ai, uber, vercel, vodafone, voltagent, warp, webflow, wired, wise, x.ai, zapier

> 取文件：`design-md/<风格>/DESIGN.md`（每个子目录含 DESIGN.md + README.md）。
