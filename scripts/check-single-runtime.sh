#!/usr/bin/env bash
# S1-T9 / FR-S1-4 · single Effect.provide site enforcement.
#
# Per SDD §5.3 (canonical primitive after BB-001) · ManagedRuntime.make
# must appear exactly once in lib/ + app/ (the `lib/runtime/runtime.ts`
# site). A second site would fragment the service graph.

set -euo pipefail

# Match actual call sites, not comments. ManagedRuntime.make(...) with parens.
COUNT=$(grep -rEc "ManagedRuntime\.make\(" --include="*.ts" --include="*.tsx" lib/ app/ 2>/dev/null | grep -v ":0$" | awk -F: '{sum += $2} END {print sum}')
COUNT="${COUNT:-0}"

if [ "$COUNT" != "1" ]; then
  echo "FAIL: $COUNT ManagedRuntime.make sites (expected exactly 1 in lib/runtime/runtime.ts)"
  echo ""
  echo "Found at:"
  grep -rn "ManagedRuntime\.make" --include="*.ts" --include="*.tsx" lib/ app/ 2>/dev/null
  exit 1
fi

echo "OK: 1 ManagedRuntime.make site (lib/runtime/runtime.ts)"
