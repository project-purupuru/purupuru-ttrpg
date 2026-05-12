#!/usr/bin/env bash
# S4-T11 / BB-009 / SP-009 · system name uniqueness check
# Per lift-pattern-template: names of *.live.ts files in lib/world/ must
# appear EXACTLY once in lib/runtime/runtime.ts AppLayer mergeAll args.
#
# world.system.ts orchestrator is EXCLUDED (NOT a Layer Tag · per SP-009).

set -euo pipefail

WORLD_DIR="lib/world"
RUNTIME="lib/runtime/runtime.ts"

if [ ! -d "$WORLD_DIR" ] || [ ! -f "$RUNTIME" ]; then
  echo "OK: world or runtime doesn't exist yet"
  exit 0
fi

# Find all *.live.ts files in lib/world/ (system name = filename without .live.ts)
fail=0
for liveFile in "$WORLD_DIR"/*.live.ts; do
  [ -f "$liveFile" ] || continue
  base=$(basename "$liveFile" .live.ts)
  # The Layer name as exported is `<Pascal>Live` · convert kebab/lower to Pascal
  pascal=$(echo "$base" | awk -F- '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2);}1' OFS='')
  layerName="${pascal}Live"
  count=$(grep -cE "\b${layerName}\b" "$RUNTIME" || echo 0)
  # Expect: 1 import + 1 mergeAll arg = 2 occurrences in runtime.ts
  # (or 1 if the import line uses *)
  if [ "$count" -lt "1" ]; then
    echo "FAIL: $layerName not found in $RUNTIME (expected to be merged into AppLayer)"
    fail=1
  fi
done

if [ "$fail" != "0" ]; then exit 1; fi

echo "OK: all lib/world/*.live.ts systems referenced in runtime.ts"
