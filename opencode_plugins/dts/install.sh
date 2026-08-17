#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CFG="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"

mkdir -p "$CFG/plugins" "$CFG/commands"

cat > "$CFG/plugins/dts.ts" <<EOF
import { tool } from "@opencode-ai/plugin"
import { createDtsPlugin } from "$HERE/dts.ts"
export const DtsPlugin = createDtsPlugin(tool)
EOF
echo "installed plugin loader -> $CFG/plugins/dts.ts"

ln -sfn "$HERE/command-dts.md" "$CFG/commands/dts.md"
echo "installed /dts command    -> $CFG/commands/dts.md"

CONFIG_FILE="$CFG/opencode.jsonc"
[ -f "$CONFIG_FILE" ] || CONFIG_FILE="$CFG/opencode.json"
if [ ! -f "$CONFIG_FILE" ]; then
  echo '{}' > "$CFG/opencode.json"
  CONFIG_FILE="$CFG/opencode.json"
fi

python3 - "$CONFIG_FILE" "$HERE/RULES.md" <<'PY'
import json, sys
path, rule = sys.argv[1], sys.argv[2]
with open(path) as f:
    cfg = json.load(f)
inst = cfg.get("instructions") or []
if rule not in inst:
    inst.append(rule)
cfg["instructions"] = inst
with open(path, "w") as f:
    json.dump(cfg, f, indent=2, ensure_ascii=False)
    f.write("\n")
print(f"registered instructions   -> {rule} (in {path})")
PY

echo "done. restart opencode to load. verify: opencode run 'list your dts tools' in any project"
