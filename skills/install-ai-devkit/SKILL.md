---
name: install-ai-devkit
description: Use when 用户要求安装 AI 开发配套工具套装（task / opencode / oh-my-pi / pi）、从 GitHub 官方 release 下载安装开发工具到 ~/.local/bin、为 AI agent 配置 provider（deepseek / ollama / 阿里云 qwen / 自定义）、或搭建本地 AI 开发环境。触发词：装 ai 开发套装、安装 ai 开发工具、安装 opencode、装 task、装 oh-my-pi、配置 provider、配模型供应商、配 api、搭本地开发环境。
---

# install-ai-devkit — 安装 AI 开发配套工具套装并配置 provider

## 激活

技能被触发时，先输出：

> **install-ai-devkit 技能已激活** — 我来帮你安装 AI 开发配套工具（task / opencode / oh-my-pi / pi）并配置模型供应商。

然后按下方工作流执行。

## 铁律（违反 = 失败）

1. **所有工具统一从 GitHub 官方 release 下载最新版**（pi 例外：官方经 npm 分发）。绝不使用第三方镜像或来路不明的安装包。
2. **安装位置默认 `~/.local/bin`**（Windows 为 `%USERPROFILE%\.local\bin`），并确保加入 PATH。pi 例外：官方经 npm 分发，装到 npm 全局目录（`npm prefix -g`）。
3. **provider 配置固定**：供应商、兼容 API 格式、模型 ID 一律按 `references/` 模板，只有 api-key 用环境变量占位，留给用户自己设置。
4. **每个环节先确认再执行**：确认系统与架构 → 确认工具清单 → 确认安装 → 配置 provider 前确认。
5. **与用户用中文交流**；工具清单用 markdown 表格展示。
6. **禁止运行时上网现找安装方法**。一切以 `scripts/` 与 `references/` 为准；仅当脚本因 GitHub API 限流等失败时，可提示用户稍后重试或改用官方一键脚本（omp.sh/install、opencode.ai/install）。

## 工具与脚本对照

| 工具 | GitHub 仓库 | 安装脚本（Unix / Windows） | 说明 |
|---|---|---|---|
| task | `go-task/task` | `scripts/install-task.sh` / `.bat` | 跨平台任务运行器，替代 Makefile，装到 ~/.local/bin |
| opencode | `anomalyco/opencode` | `scripts/install-opencode.sh` / `.bat` | AI agent CLI（原 sst/opencode） |
| oh-my-pi (omp) | `can1357/oh-my-pi` | `scripts/install-omp.sh` / `.bat` | AI agent，pi 的增强 fork |
| pi | `earendil-works/pi` | `scripts/install-pi.sh` / `.bat` | AI agent，官方经 npm 分发（CLI 名 `pi`，装到 npm 全局目录，非 ~/.local/bin） |

一键安装全部四个：`scripts/install-ai-devkit.sh`（Unix）或 `scripts/install-ai-devkit.bat`（Windows）。

## 工作流（REQUIRED，按顺序执行，不可跳过）

1. **确认系统与架构**
   - Windows：`$env:OS` + `$env:PROCESSOR_ARCHITECTURE`（AMD64 / ARM64）
   - Linux/macOS：`uname -s` + `uname -m`（x86_64 → x64/amd64，aarch64/arm64 → arm64）
2. **展示工具清单** — 用 markdown 表格展示四个工具（名称 | 仓库 | 用途 | 安装脚本），默认全选，让用户确认。
3. **执行安装** — 按确认的清单运行对应脚本：
   - Unix：`sh scripts/install-xxx.sh`；一键：`sh scripts/install-ai-devkit.sh`
   - Windows：运行 `scripts\install-xxx.bat`；一键：`install-ai-devkit.bat`
   - 装到用户目录**无需管理员权限**（pi 除外：npm 全局目录可能需要管理员）；仅当用户要求装到系统目录（如 `C:\Program Files`）时，提示以管理员身份运行并将 `INSTALL_DIR` 指向系统目录。
   - 脚本自动从 GitHub API 解析最新 release 并下载对应系统/架构的 asset；未认证限流 60 次/小时，失败时稍后重试。
4. **检测已安装的 agent** — Unix：`command -v opencode omp pi`；Windows：`Get-Command opencode, omp, pi`。
5. **配置 provider** — 对**每个已安装的 agent** 执行「配置 provider」一节。
6. **建议安装技能** — 询问用户是否继续用 `ai-skills-office` 技能挑选安装实用技能（开发/测试/文案办公/设计/运维）。
7. **验证并汇报** — 运行各 agent 的版本/模型列表命令（如 `opencode models`、`omp models`、`pi models`）验证配置生效，向用户报告结果与下一步。

## 配置 provider（核心）

对每个已安装的 agent，找到全局配置文件，**不存在则创建标准文件**，然后追加模板内容（保留用户已有配置）：

| agent | 全局配置文件 | 模板 |
|---|---|---|
| opencode | `~/.config/opencode/opencode.json`（Windows：`%USERPROFILE%\.config\opencode\opencode.json`） | `references/opencode-providers.json` |
| oh-my-pi (omp) | `~/.omp/agent/models.yml` | `references/omp-models.yml` |
| pi | `~/.pi/agent/models.json` | `references/pi-models.json` |

每个 agent 的配置都包含**四类固定 provider**（api-key 一律留占位）：

1. **DeepSeek 标准供应商** — `baseURL: https://api.deepseek.com`，模型 `deepseek-v4-flash` + `deepseek-v4-pro`
2. **本地 ollama** — `http://localhost:11434`，免认证（omp 用 `auth: none`；pi 用占位 apiKey）
3. **阿里云（dashscope compatible-mode）** — `baseURL: https://dashscope.aliyuncs.com/compatible-mode/v1`，模型 `qwen3.6` / `qwen3.7` / `qwen3.8`
4. **自定义供应商** — `baseURL` 与 `apiKey` 引用环境变量 `MY_CUSTOM_PROVIDER_BASE_URL` / `MY_CUSTOM_PROVIDER_API_KEY`

步骤：

1. 找到配置文件；不存在则按模板创建。
2. 若已存在 `providers` 段，**合并**缺失的 provider 键，绝不覆盖用户已有配置。
3. api-key 一律用环境变量占位（opencode：`{env:VAR}`；omp：环境变量名；pi：`$VAR`），**不写入真实密钥**。
4. 告知用户需要设置的环境变量（写进 `.env` 或 shell 配置 / Windows `setx`）：
   - `DEEPSEEK_API_KEY`
   - `DASHSCOPE_API_KEY`
   - `MY_CUSTOM_PROVIDER_BASE_URL` + `MY_CUSTOM_PROVIDER_API_KEY`
5. **模型 ID 说明**：
   - deepseek 固定 `deepseek-v4-flash` / `deepseek-v4-pro`（2026-08 为 DeepSeek 官方 API 当前模型 ID）；若官方后续调整，按官方模型列表更新并先询问用户确认。
   - qwen 系列固定 `qwen3.6` / `qwen3.7` / `qwen3.8`；若实际调用报模型不存在，按阿里云百炼模型列表在末尾补官方后缀（如 `qwen3.7-plus`），并先询问用户确认。

## 常见错误

| 错误 | 修正 |
|---|---|
| 从非官方渠道下载安装包 | 一律从 `github.com/<owner>/<repo>/releases` 官方 release 下载（pi 走官方 npm 包） |
| 让用户手动去 GitHub 找下载链接 | 直接运行 `scripts/` 下的安装脚本，自动解析最新版本 |
| 给 qwen 模型 ID 编造后缀 | 固定 `qwen3.6` / `qwen3.7` / `qwen3.8`，需要精确型号时查官方列表后询问用户 |
| 在配置文件里写入真实 api-key | 一律用环境变量占位，密钥由用户自行设置 |
| 覆盖用户已有的 provider 配置 | 合并而非覆盖：只追加缺失的 provider 键 |
| 认为装到用户目录需要管理员权限 | 装到 `~/.local/bin` 不需要；只有用户指定系统目录才提示管理员 |
| 把 provider 配置错配到别的文件 | 严格按「配置 provider」一节的路径表 |

## Red Flags — 停下检查

- 想「先上网搜一下安装命令」→ `scripts/` 已备好，直接用
- 想「顺便把别的工具也装了」→ 超出清单范围，先询问用户
- 想在配置里填真实密钥 → 用环境变量占位
- 想覆盖用户已有的 provider 配置 → 合并
- 用户说「赶时间别问太多」→ 仍须确认系统 + 工具清单（可合并为一次提问）
