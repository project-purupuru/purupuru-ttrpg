#!/usr/bin/env bash
# =============================================================================
# advisor-strategy-resolver.sh — Cycle-108 sprint-1 T1.I bash twin
# =============================================================================
# Thin bash wrapper that exec's the Python canonical resolver to guarantee
# single-source-of-truth resolution semantics. There is NO parallel bash
# implementation — the function shells out to Python and consumes the
# JSON ResolvedTier from stdout.
#
# This pattern intentionally avoids the cross-runtime parity trap class
# documented in feedback_cross_runtime_parity_traps.md (cycle-099 lessons):
# when bash and Python independently re-implement the same logic, they
# drift in subtle ways (Unicode normalization, JSON ordering, regex
# semantics). The exec-wrapper pattern eliminates the drift surface.
#
# Closes SDD §3.5 (FR-2 cheval routing extension bash twin) and §21.1
# (Flatline IMP-001 single source of truth for AdvisorStrategyConfig).
#
# Usage (as library — source me):
#   source .claude/scripts/lib/advisor-strategy-resolver.sh
#   resolved_json=$(advisor_strategy_resolve "implementation" "implementing-tasks" "anthropic")
#   model_id=$(echo "$resolved_json" | jq -r '.model_id')
#
# Usage (as CLI — for testing):
#   .claude/scripts/lib/advisor-strategy-resolver.sh resolve <role> <skill> <provider>
# =============================================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$SCRIPT_DIR/../../.." && pwd)}"

# advisor_strategy_resolve <role> <skill> <provider>
#   Returns JSON on stdout matching ResolvedTier dataclass.
#   Exit codes:
#     0  - success
#     78 - EX_CONFIG (advisor-strategy config invalid; see stderr)
#     1  - other error (Python ImportError, missing jsonschema, etc)
advisor_strategy_resolve() {
    local role="$1"
    local skill="$2"
    local provider="$3"

    python3 -c "
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path('$PROJECT_ROOT') / '.claude' / 'adapters'))
try:
    from loa_cheval.config.advisor_strategy import (
        load_advisor_strategy,
        AdvisorStrategyConfig,
        ConfigError,
    )
except ImportError as e:
    sys.stderr.write(f'[advisor-strategy-resolver] ImportError: {e}\n')
    sys.exit(1)

try:
    cfg = load_advisor_strategy(Path('$PROJECT_ROOT'))
except ConfigError as e:
    sys.stderr.write(f'[advisor-strategy-resolver] EX_CONFIG: {e}\n')
    sys.exit(78)

if not cfg.enabled:
    # Disabled-by-config or kill-switch — emit a sentinel that callers can
    # detect via .tier_source == 'disabled_legacy'
    out = {
        'model_id': '',
        'tier': '',
        'tier_source': 'disabled_legacy',
        'tier_resolution': 'disabled',
        'provider': '$provider',
    }
    print(json.dumps(out))
    sys.exit(0)

try:
    resolved = cfg.resolve(role='$role', skill='$skill', provider='$provider')
except ConfigError as e:
    sys.stderr.write(f'[advisor-strategy-resolver] EX_CONFIG: {e}\n')
    sys.exit(78)

print(json.dumps({
    'model_id': resolved.model_id,
    'tier': resolved.tier,
    'tier_source': resolved.tier_source,
    'tier_resolution': resolved.tier_resolution,
    'provider': resolved.provider,
}))
"
}

# CLI entrypoint when not sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-}" in
        resolve)
            shift
            if [[ "$#" -ne 3 ]]; then
                echo "Usage: $0 resolve <role> <skill> <provider>" >&2
                exit 2
            fi
            advisor_strategy_resolve "$@"
            ;;
        -h|--help|"")
            cat <<EOF
advisor-strategy-resolver.sh — Cycle-108 T1.I bash twin

Usage:
  Source me:
    source .claude/scripts/lib/advisor-strategy-resolver.sh
    advisor_strategy_resolve <role> <skill> <provider>

  Or CLI:
    $0 resolve <role> <skill> <provider>

Role: planning | review | implementation
Provider: anthropic | openai | google

Returns JSON ResolvedTier on stdout. Exit 78 = EX_CONFIG (invalid config).
See SDD §3.5 + §21.1 for details.
EOF
            exit 0
            ;;
        *) echo "Unknown subcommand: $1" >&2; exit 2 ;;
    esac
fi
