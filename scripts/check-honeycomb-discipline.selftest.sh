#!/usr/bin/env bash
# Fixture smoke tests for the Honeycomb substrate guard.

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "FAIL: scripts/check-honeycomb-discipline.selftest.sh must run inside a git repository"
  exit 2
}

tmp="$(mktemp -d "$ROOT/.tmp-honeycomb-selftest.XXXXXX")"
cleanup() {
  rm -rf "$tmp"
}
trap cleanup EXIT

guard="$ROOT/scripts/check-honeycomb-discipline.sh"
honeycomb="$tmp/lib/honeycomb"
runtime="$tmp/lib/runtime/runtime.ts"

reset_fixture() {
  rm -rf "$tmp/lib"
  mkdir -p "$honeycomb" "$(dirname "$runtime")"
  cat > "$honeycomb/foo.port.ts" <<'EOF'
export interface FooPort {}
EOF
  cat > "$honeycomb/foo.live.ts" <<'EOF'
export const FooLive = {};
EOF
  cat > "$honeycomb/foo.mock.ts" <<'EOF'
export const FooMock = {};
EOF
  cat > "$runtime" <<'EOF'
import { FooLive } from './foo.live';
export const RuntimeLive = FooLive;
EOF
}

run_guard() {
  HONEYCOMB_DIR="$honeycomb" HONEYCOMB_RUNTIME="$runtime" bash "$guard"
}

reset_fixture
run_guard >/dev/null

reset_fixture
touch "$honeycomb/bad.tsx"
if run_guard >/tmp/honeycomb-selftest.out 2>&1; then
  echo "FAIL: guard accepted TSX in lib/honeycomb"
  exit 1
fi
grep -q "must not contain TSX" /tmp/honeycomb-selftest.out

reset_fixture
cat > "$honeycomb/foo.port.ts" <<'EOF'
import React from 'react';
export interface FooPort {}
EOF
if run_guard >/tmp/honeycomb-selftest.out 2>&1; then
  echo "FAIL: guard accepted UI import in lib/honeycomb"
  exit 1
fi
grep -q "must not import UI/framework" /tmp/honeycomb-selftest.out

echo "OK: Honeycomb substrate discipline selftest passed"
