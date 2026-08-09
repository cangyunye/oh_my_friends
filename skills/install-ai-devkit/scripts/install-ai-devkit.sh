#!/usr/bin/env sh
# ============================================================================
# install-ai-devkit.sh — 一键安装 AI 开发配套工具套装：
#   task（go-task/task）+ opencode + oh-my-pi（omp）+ pi
# 所有工具统一从 GitHub 官方 release 下载（pi 走官方 npm 包），
# 安装到 ~/.local/bin（可用环境变量 INSTALL_DIR 覆盖）并自动加入 PATH。
# 用法: sh install-ai-devkit.sh
# 某个工具失败会立即中止；可单独运行 scripts/ 下对应脚本只装单个工具。
# ============================================================================
set -eu

INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
export INSTALL_DIR
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=============================================="
echo "  AI 开发配套工具安装 (install-ai-devkit)"
echo "  安装目录: $INSTALL_DIR"
echo "=============================================="

echo ""
echo "==> [1/4] 安装 task (go-task/task)"
sh "$DIR/install-task.sh"

echo ""
echo "==> [2/4] 安装 opencode"
sh "$DIR/install-opencode.sh"

echo ""
echo "==> [3/4] 安装 oh-my-pi (omp)"
sh "$DIR/install-omp.sh"

echo ""
echo "==> [4/4] 安装 pi"
sh "$DIR/install-pi.sh"

echo ""
echo "=============================================="
echo "[OK] 工具安装完成：task / opencode / omp / pi"
echo "   - provider（deepseek / ollama / 阿里云 qwen / 自定义）配置"
echo "     与技能安装，请让 AI 按本技能 SKILL.md 的工作流继续。"
echo "=============================================="
