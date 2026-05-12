#!/usr/bin/env bash
# S4-T10 / BB-006 · state ownership matrix enforcement
# Observatory MUST NOT write to any Ref/PubSub (read-only per matrix).

set -uo pipefail

WORLD_DIR="lib/world"

if [ ! -d "$WORLD_DIR" ]; then
  echo "OK: $WORLD_DIR doesn't exist yet"
  exit 0
fi

OBS_FILES=$(ls "$WORLD_DIR"/observatory.*.ts 2>/dev/null || true)

if [ -z "$OBS_FILES" ]; then
  echo "OK: no observatory.* files yet"
  exit 0
fi

# Use grep -l (list files) not -c (count) to avoid awk-arithmetic gotchas
WRITES=$(grep -lE "Ref\.set|Ref\.update|PubSub\.publish" $OBS_FILES 2>/dev/null | wc -l | tr -d ' ')
if [ "${WRITES:-0}" != "0" ]; then
  echo "FAIL: $WRITES observatory.* files contain Ref/PubSub writes (matrix declares read-only)"
  grep -lnE "Ref\.set|Ref\.update|PubSub\.publish" $OBS_FILES
  exit 1
fi

echo "OK: state ownership matrix honored (observatory read-only)"
