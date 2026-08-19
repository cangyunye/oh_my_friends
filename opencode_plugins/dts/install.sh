#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CFG="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"

mkdir -p "$CFG/plugins" "$CFG/commands"

# 1. loader —— 在插件目录外生成,由它 import 仓库内零依赖源码
cat > "$CFG/plugins/dts.ts" <<EOF
import { tool } from "@opencode-ai/plugin"
import { createDtsPlugin } from "$HERE/dts.ts"
export const DtsPlugin = createDtsPlugin(tool)
EOF
echo "installed plugin loader -> $CFG/plugins/dts.ts"

# 2. /dts command —— 优先 symlink,失败(如 Windows 权限)退化为复制
CMD_TARGET="$CFG/commands/dts.md"
if ln -sfn "$HERE/command-dts.md" "$CMD_TARGET" 2>/dev/null; then
  echo "installed /dts command    -> $CMD_TARGET (symlink)"
else
  cp -f "$HERE/command-dts.md" "$CMD_TARGET"
  echo "installed /dts command    -> $CMD_TARGET (copy, 改动 command-dts.md 后需重跑安装)"
fi

# 3. 把 RULES.md 注册进全局 instructions —— JSONC 兼容(容忍注释/尾逗号)
CONFIG_FILE="$CFG/opencode.jsonc"
[ -f "$CONFIG_FILE" ] || CONFIG_FILE="$CFG/opencode.json"
if [ ! -f "$CONFIG_FILE" ]; then
  printf '{\n}\n' > "$CONFIG_FILE"
fi

if command -v python3 >/dev/null 2>&1; then
  JSON_TOOL=python3
elif command -v python >/dev/null 2>&1; then
  JSON_TOOL=python
elif command -v node >/dev/null 2>&1; then
  JSON_TOOL=node
else
  echo "error: 需要 python3/python 或 node 才能修改 $CONFIG_FILE" >&2
  exit 1
fi

if [ "$JSON_TOOL" = node ]; then
  node - "$CONFIG_FILE" "$HERE/RULES.md" <<'JS'
const fs = require("fs")
const [path, rule] = process.argv.slice(2)
function stripJsonc(s) {
  let out = "", i = 0, inStr = false, esc = false
  while (i < s.length) {
    const c = s[i]
    if (inStr) {
      out += c
      if (esc) esc = false
      else if (c === "\\") esc = true
      else if (c === '"') inStr = false
      i++
      continue
    }
    if (c === '"') { inStr = true; out += c; i++; continue }
    if (c === "/" && s[i + 1] === "/") { while (i < s.length && s[i] !== "\n") i++; continue }
    if (c === "/" && s[i + 1] === "*") { i += 2; while (i + 1 < s.length && !(s[i] === "*" && s[i + 1] === "/")) i++; i += 2; continue }
    out += c; i++
  }
  out = out.replace(/,(\s*[}\]])/g, "$1")
  return out
}
let raw = fs.readFileSync(path, "utf8")
let cfg
try { cfg = JSON.parse(raw) } catch (e) { cfg = JSON.parse(stripJsonc(raw)) }
const inst = cfg.instructions || []
if (!inst.includes(rule)) inst.push(rule)
cfg.instructions = inst
fs.writeFileSync(path, JSON.stringify(cfg, null, 2) + "\n")
console.log("registered instructions   -> " + rule + " (in " + path + ")")
JS
else
  "$JSON_TOOL" - "$CONFIG_FILE" "$HERE/RULES.md" <<'PY'
import json, re, sys

def strip_jsonc(s):
    out, i, n, in_str, esc = [], 0, len(s), False, False
    while i < n:
        c = s[i]
        if in_str:
            out.append(c)
            if esc:
                esc = False
            elif c == '\\':
                esc = True
            elif c == '"':
                in_str = False
            i += 1
            continue
        if c == '"':
            in_str = True
            out.append(c)
            i += 1
            continue
        if c == '/' and i + 1 < n and s[i + 1] == '/':
            while i < n and s[i] != '\n':
                i += 1
            continue
        if c == '/' and i + 1 < n and s[i + 1] == '*':
            i += 2
            while i + 1 < n and not (s[i] == '*' and s[i + 1] == '/'):
                i += 1
            i += 2
            continue
        out.append(c)
        i += 1
    return re.sub(r',(\s*[}\]])', r'\1', ''.join(out))

path, rule = sys.argv[1], sys.argv[2]
with open(path) as f:
    raw = f.read()
try:
    cfg = json.loads(raw)
except ValueError:
    cfg = json.loads(strip_jsonc(raw))
inst = cfg.get("instructions") or []
if rule not in inst:
    inst.append(rule)
cfg["instructions"] = inst
with open(path, "w") as f:
    json.dump(cfg, f, indent=2, ensure_ascii=False)
    f.write("\n")
print("registered instructions   -> %s (in %s)" % (rule, path))
PY
fi

echo "done. restart opencode to load. verify: opencode run 'list your dts tools' in any project"
echo "Windows 用户: powershell -ExecutionPolicy Bypass -File \"$HERE/install.ps1\""
