#!/usr/bin/env bash
# S1-T5 / FR-S1-2 / Q4 · Envelope coverage CI gate.
#
# Counts S.Literal _tag occurrences vs output_type: occurrences in
# packages/peripheral-events/src/world-event.ts and asserts equality.
#
# Fragile by design: if the file shape changes, this breaks loudly so
# the operator decides whether to fix the script or restructure the file.
#
# Per BB-007 / SDD §4.4 · regex pinned · zero deps.

set -euo pipefail

FILE="packages/peripheral-events/src/world-event.ts"

if [ ! -f "$FILE" ]; then
  echo "FAIL: $FILE not found"
  exit 1
fi

TAGS=$(grep -cE "_tag:\s*S\.Literal" "$FILE" || echo 0)
TYPES=$(grep -cE "output_type:\s*S\.Literal" "$FILE" || echo 0)

if [ "$TAGS" != "$TYPES" ]; then
  echo "FAIL: $TAGS _tag variants vs $TYPES output_type annotations in $FILE"
  echo "Every discriminated-union variant in WorldEvent must carry an output_type literal."
  exit 1
fi

echo "OK: $TAGS variants all tagged with output_type"
