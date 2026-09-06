#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXT_DIR="${PI_EXTENSIONS_DIR:-$HOME/.pi/agent/extensions}"

mkdir -p "$EXT_DIR"

# pi 通过 jiti 加载扩展,typebox 由 pi 内置解析;仓库源码保持零依赖,由 loader 注入
# Windows Git Bash 下 $HERE 是 /f/... 形式,node/jiti 需要原生路径,cygpath -m 转成 F:/...
if command -v cygpath >/dev/null 2>&1; then
  SRC="$(cygpath -m "$HERE")"
else
  SRC="$HERE"
fi

cat > "$EXT_DIR/dts.ts" <<EOF
import { Type } from "typebox"
import { createDtsPiExtension } from "$SRC/pi.ts"

export default function (pi) {
  createDtsPiExtension({ pi, Type, rulesPath: "$SRC/RULES.md" })
}
EOF
echo "installed pi extension loader -> $EXT_DIR/dts.ts"
echo "  (rules 注入 + 7 个 dts_* 工具 + /dts 命令,均由仓库源码 $SRC 提供,改源码即时生效)"

cat <<'NOTE'

done. 新开 pi 会话即自动加载(全局扩展)。
验证:
  pi --no-session -p "列出你当前可用的 dts 工具名"
卸载:
  rm "$HOME/.pi/agent/extensions/dts.ts"
NOTE
