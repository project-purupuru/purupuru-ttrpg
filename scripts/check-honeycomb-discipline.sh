#!/usr/bin/env bash
# Honeycomb substrate discipline.
#
# Keeps lib/honeycomb agent-readable without freezing creative work in
# app/battle. The route may iterate freely; the substrate keeps typed seams.
# The import scan is intentionally zero-dependency so it can run during install
# and build bootstrap. It strips comments before a lexical import scan; graduate
# this to a TypeScript AST rule if Honeycomb starts using complex syntax that the
# selftest fixtures cannot cover.

set -euo pipefail
# Empty service globs are intentional: the guard may ship before every
# substrate service exists, but any service that does exist must be paired.
shopt -s nullglob

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "FAIL: scripts/check-honeycomb-discipline.sh must run inside a git repository"
  exit 2
}
cd "$ROOT"

HONEYCOMB_DIR="${HONEYCOMB_DIR:-lib/honeycomb}"
RUNTIME="${HONEYCOMB_RUNTIME:-lib/runtime/runtime.ts}"
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

if ! command -v node >/dev/null 2>&1; then
  echo "FAIL: node is required to scan Honeycomb TypeScript imports"
  fail=1
else
  if ! HONEYCOMB_DIR="$HONEYCOMB_DIR" node <<'NODE'
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const honeycombDir = path.resolve(root, process.env.HONEYCOMB_DIR || 'lib/honeycomb');
const collectionSeed = path.join(honeycombDir, 'collection.seed.ts');
const errors = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() && entry.name.endsWith('.ts') ? [fullPath] : [];
  });
}

function stripComments(source) {
  // Non-greedy block comment stripping is sufficient because TypeScript does
  // not support nested block comments.
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function importSpecifiers(source) {
  const stripped = stripComments(source);
  const patterns = [
    /(?:^|[\n;])\s*import\s+(?:type\s+)?(?:[^'";]*?\s+from\s*)?['"]([^'"]+)['"]/g,
    /(?:^|[\n;])\s*export\s+(?:type\s+)?[^'";]*?\s+from\s*['"]([^'"]+)['"]/g,
    // Intentionally limited to static string specifiers. Non-static calls are
    // rejected below; graduate to AST parsing if this rule needs more nuance.
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  return patterns.flatMap((pattern) => Array.from(stripped.matchAll(pattern), (match) => match[1]));
}

function nonStaticModuleCalls(source) {
  const stripped = stripComments(source);
  const calls = [];
  for (const match of stripped.matchAll(/\b(import|require)\s*\(\s*([^)]+?)\s*\)/g)) {
    const callee = match[1];
    const argument = match[2].trim();
    if (!/^['"][^'"]+['"]$/.test(argument)) {
      calls.push(`${callee}(${argument})`);
    }
  }
  return calls;
}

function rel(file) {
  return path.relative(root, file);
}

for (const file of walk(honeycombDir)) {
  const source = fs.readFileSync(file, 'utf8');
  for (const call of nonStaticModuleCalls(source)) {
    errors.push(`FAIL: lib/honeycomb must not use non-static import or require calls: ${rel(file)} -> ${call}`);
  }
  for (const specifier of importSpecifiers(source)) {
    if (
      /^(react|react-dom|next|motion|framer-motion)(\/|$)/.test(specifier) ||
      /^(@radix-ui|lucide-react)(\/|$)/.test(specifier) ||
      specifier === '@/app' ||
      specifier.startsWith('@/app/') ||
      /^(\.\.\/)+.*app\//.test(specifier)
    ) {
      errors.push(`FAIL: lib/honeycomb must not import UI/framework modules: ${rel(file)} -> ${specifier}`);
    }
    if (specifier.startsWith('@/lib/runtime/') && path.resolve(file) !== collectionSeed) {
      errors.push(`FAIL: lib/honeycomb runtime imports are only allowed in collection.seed.ts: ${rel(file)} -> ${specifier}`);
    }
    if (/^(@solana|@metaplex-foundation|@vercel\/kv)(\/|$)/.test(specifier)) {
      errors.push(`FAIL: lib/honeycomb must stay chain/backend agnostic: ${rel(file)} -> ${specifier}`);
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  process.exit(1);
}
NODE
  then
    fail=1
  fi
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

live_files=("$HONEYCOMB_DIR"/*.live.ts)
if [ -f "$RUNTIME" ]; then
  for live in "${live_files[@]}"; do
    base=$(basename "$live" .live.ts)
    pascal=$(echo "$base" | LC_ALL=C awk -F- '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2);}1' OFS='')
    layer="${pascal}Live"
    if ! grep -qE "\\b${layer}\\b" "$RUNTIME"; then
      echo "FAIL: $layer is not referenced from $RUNTIME"
      fail=1
    fi
  done
elif [ "${#live_files[@]}" -gt 0 ]; then
  echo "FAIL: runtime file not found for live adapter registration check: $RUNTIME"
  fail=1
fi

if [ "$fail" != "0" ]; then
  exit 1
fi

echo "OK: Honeycomb substrate discipline honored"
