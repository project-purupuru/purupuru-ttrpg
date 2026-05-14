#!/usr/bin/env bash
# Honeycomb substrate discipline.
#
# Keeps lib/honeycomb agent-readable without freezing creative work in
# app/battle. The route may iterate freely; the substrate keeps typed seams.

set -euo pipefail
shopt -s nullglob

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

HONEYCOMB_DIR="lib/honeycomb"
RUNTIME="lib/runtime/runtime.ts"
SERVICE_RE='^[a-z][a-z0-9]*(-[a-z0-9]+)*$'

if [ ! -d "$HONEYCOMB_DIR" ]; then
  echo "OK: $HONEYCOMB_DIR does not exist yet"
  exit 0
fi

fail=0

TSX_FILES=$(find "$HONEYCOMB_DIR" -type f -name "*.tsx" 2>/dev/null || true)
if [ -n "$TSX_FILES" ]; then
  echo "FAIL: lib/honeycomb must not contain TSX/UI component files"
  echo "$TSX_FILES"
  fail=1
fi

UI_IMPORTS=$(grep -RInE "(from|import|require).*['\"](react|react-dom|next|motion|framer-motion|@radix-ui|lucide-react|@/app|\\.\\./.*app/)" "$HONEYCOMB_DIR" --include="*.ts" 2>/dev/null || true)
if [ -n "$UI_IMPORTS" ]; then
  echo "FAIL: lib/honeycomb must not import UI/framework modules"
  echo "$UI_IMPORTS"
  fail=1
fi

RUNTIME_IMPORTS=$(grep -RInE "(from|import|require).*['\"]@/lib/runtime/" "$HONEYCOMB_DIR" --include="*.ts" 2>/dev/null | grep -vE "^${HONEYCOMB_DIR}/collection\\.seed\\.ts:" || true)
if [ -n "$RUNTIME_IMPORTS" ]; then
  echo "FAIL: lib/honeycomb runtime imports are only allowed in collection.seed.ts"
  echo "$RUNTIME_IMPORTS"
  fail=1
fi

CHAIN_IMPORTS=$(grep -RInE "(from|import|require).*['\"](@solana|@metaplex-foundation|@vercel/kv)" "$HONEYCOMB_DIR" --include="*.ts" 2>/dev/null || true)
if [ -n "$CHAIN_IMPORTS" ]; then
  echo "FAIL: lib/honeycomb must stay chain/backend agnostic"
  echo "$CHAIN_IMPORTS"
  fail=1
fi

for port in "$HONEYCOMB_DIR"/*.port.ts; do
  base=$(basename "$port" .port.ts)
  if [[ ! "$base" =~ $SERVICE_RE ]]; then
    echo "FAIL: service filename must be kebab-case: $port"
    fail=1
    continue
  fi
  if [ ! -f "$HONEYCOMB_DIR/$base.live.ts" ]; then
    echo "FAIL: missing live adapter for $port"
    fail=1
  fi
  if [ ! -f "$HONEYCOMB_DIR/$base.mock.ts" ]; then
    echo "FAIL: missing mock adapter for $port"
    fail=1
  fi
done

for adapter in "$HONEYCOMB_DIR"/*.live.ts "$HONEYCOMB_DIR"/*.mock.ts; do
  base=$(basename "$adapter")
  if [[ "$base" == *.live.ts ]]; then
    service="${base%.live.ts}"
  else
    service="${base%.mock.ts}"
  fi
  if [[ ! "$service" =~ $SERVICE_RE ]]; then
    echo "FAIL: adapter filename must be kebab-case: $adapter"
    fail=1
    continue
  fi
  if [ ! -f "$HONEYCOMB_DIR/$service.port.ts" ]; then
    echo "FAIL: missing port for adapter $adapter"
    fail=1
  fi
done

if [ -f "$RUNTIME" ]; then
  for live in "$HONEYCOMB_DIR"/*.live.ts; do
    base=$(basename "$live" .live.ts)
    pascal=$(echo "$base" | awk -F- '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2);}1' OFS='')
    layer="${pascal}Live"
    if ! grep -qE "\\b${layer}\\b" "$RUNTIME"; then
      echo "FAIL: $layer is not referenced from $RUNTIME"
      fail=1
    fi
  done
fi

if [ "$fail" != "0" ]; then
  exit 1
fi

echo "OK: Honeycomb substrate discipline honored"
