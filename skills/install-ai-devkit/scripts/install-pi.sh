#!/usr/bin/env sh
# ============================================================================
# install-pi.sh — 安装 pi（earendil-works/pi）AI agent。
# pi 官方通过 npm 分发（包名 @earendil-works/pi-coding-agent，CLI 名为 pi），
# 没有官方 release 二进制，因此本脚本走 npm / bun 全局安装。
# 注意：pi 装到 npm 全局目录（npm prefix -g），不是 ~/.local/bin；
#       若 npm 全局目录需要写权限（如 /usr/local），可能需要 sudo。
# 用法: sh install-pi.sh
# ============================================================================
set -eu

if command -v npm >/dev/null 2>&1; then
  echo "[INFO] 使用 npm 全局安装 @earendil-works/pi-coding-agent ..."
  echo "[INFO] npm 全局目录: $(npm prefix -g 2>/dev/null || echo '未知')"
  npm install -g @earendil-works/pi-coding-agent
elif command -v bun >/dev/null 2>&1; then
  echo "[INFO] 使用 bun 全局安装 @earendil-works/pi-coding-agent ..."
  bun add -g @earendil-works/pi-coding-agent
else
  echo "[ERROR] 未检测到 npm 或 bun。pi 官方通过 npm 分发，请先安装 Node.js（https://nodejs.org）后重试。" >&2
  exit 1
fi

echo "[OK] pi 已安装。验证："
if command -v pi >/dev/null 2>&1; then
  pi --version 2>/dev/null || pi version 2>/dev/null || echo "   pi 命令可用（版本命令因版本而异，可运行 pi --help 查看）"
else
  echo "[WARN] pi 不在 PATH 中。请将 npm 全局 bin 目录加入 PATH（见上方 npm 全局目录输出）。"
fi
