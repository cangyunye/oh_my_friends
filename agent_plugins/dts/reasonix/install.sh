#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DTS_HOME="$(cd "$HERE/.." && pwd)"

if ! command -v reasonix >/dev/null 2>&1; then
  echo "error: 未找到 reasonix 命令,请先安装(https://github.com/esengine/DeepSeek-Reasonix)" >&2
  exit 1
fi

# 插件根 = dts 目录(内含 reasonix-plugin.json);--link 开发模式,源码改动即时生效
reasonix plugin install "$DTS_HOME" --link --replace --yes

echo
reasonix plugin show dts || true
echo
echo "done. 验证:"
echo "  reasonix plugin list           # 应出现 dts"
echo "  reasonix plugin doctor dts     # 体检"
echo "  在会话里输入 /:dts 回顾档案;排查问题时 agent 会调用 dts_* MCP 工具"
echo "卸载: reasonix plugin remove dts"
