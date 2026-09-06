#!/usr/bin/env bash
# dts trae cn 插件安装脚本(Linux/macOS/Git Bash)
#
# Trae CN 没有 TS 插件 API,接入方式是:
#   1. 项目规则:.trae/rules/project_rules.md(本脚本写入 rules-dts.md 规则块,标记幂等)
#   2. MCP:Trae 通过 UI(设置 → MCP)添加,本脚本打印即贴即用的 mcpServers JSON
#   3. (可选)自定义智能体:UI 中绑定上面两项,见 README.md
#
# 用法: ./install.sh [项目目录](默认当前目录)
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DTS_HOME="$(cd "$HERE/.." && pwd)"
PROJECT="${1:-$PWD}"

if command -v cygpath >/dev/null 2>&1; then
  DTS_HOME_WIN="$(cygpath -m "$DTS_HOME")"
else
  DTS_HOME_WIN="$DTS_HOME"
fi

# 1. 项目规则:合并 dts 规则块(marker 幂等,可重复运行;文本单一来源 rules-dts.md)
RULES_DIR="$PROJECT/.trae/rules"
RULES_FILE="$RULES_DIR/project_rules.md"
mkdir -p "$RULES_DIR"

if [ -f "$RULES_FILE" ] && grep -q "dts-plugin:begin" "$RULES_FILE"; then
  echo "rules 已存在(检测到 dts-plugin:begin 标记),跳过: $RULES_FILE"
else
  {
    if [ -f "$RULES_FILE" ]; then cat "$RULES_FILE"; echo; fi
    cat "$HERE/rules-dts.md"
  } > "$RULES_FILE.tmp" && mv "$RULES_FILE.tmp" "$RULES_FILE"
  echo "installed project rules   -> $RULES_FILE (dts 规则块已追加)"
fi

# 2. MCP 配置:打印即贴即用 JSON(Trae:设置 → MCP → 添加 MCP Server → 粘贴 JSON)
echo
echo "在 Trae CN 中添加 MCP Server(头像 → 设置 → MCP → 添加),粘贴以下 JSON:"
echo
cat <<JSON
{
  "mcpServers": {
    "dts": {
      "command": "node",
      "args": ["$DTS_HOME_WIN/mcp/launch.mjs"]
    }
  }
}
JSON
echo
echo "done. 后续步骤见 $HERE/README.md(自定义智能体绑定、验证、卸载)"
