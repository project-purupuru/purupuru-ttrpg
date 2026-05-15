# Purupuru Resonance Profiles

Resonance profiles decomposed from **Gumi's original game pitch**
(`grimoires/loa/context/10-game-pitch.md`, created 2026-03-23). That pitch is
the *genesis* document — it evolved into the world-arena work, the harness, and
the cycle-1 slice. These profiles capture the **founding resonance**: the
purest statement of intent before implementation compromises, the seed DNA the
current build grew from.

Each profile is a **k-hole fingerprint** — it tells the K-hole construct what
creates gravitational pull toward depth *for this game specifically*. Findings
that connect to a profile's anchors get surfaced prominently in every synthesis.

Per the K-hole template: *"This isn't a config file. It's a self-portrait."*
These are the game's self-portrait at genesis, sliced by resonant dimension.

> **Origin, not override.** Where the current build diverges from these
> profiles, that's evolution — but the profiles remain the origin of resonance.
> When a dig surfaces something that contradicts a profile, that's a signal
> worth naming, not a bug.

## Why these exist

Earlier reference research floated free — abstract "what do stylized 3D games
do" digs that returned synthesis with confabulated source URLs. The fix is
**grounding**: every future dig runs weighted by a resonance profile derived
from the actual pitch, so what surfaces is what matters *to Purupuru*.

They serve two constructs:
- **K-hole** — pass via `--resonance` so digs are pitch-weighted
- **The Easel** — visual-direction work grounds in the same anchors

And they ground the **creative-resonance-envelopes** (`schemas/` in
construct-k-hole): an envelope's `direction.name` should map to a profile here;
its `resonance.strength` is scored against these anchors.

## How to use

```bash
# Dig weighted by a specific facet
npx tsx .claude/constructs/packs/k-hole/scripts/dig-search.ts \
  --query "..." --resonance grimoires/k-hole/resonance-profiles/01-elemental-tactics.yaml

# Dig weighted by the whole-game fingerprint
... --resonance grimoires/k-hole/resonance-profiles/00-purupuru.yaml
```

`loadResonance()` also auto-discovers a `resonance-profile.yaml` walking up from
the script dir. To make `00-purupuru.yaml` the auto-loaded default, symlink it
to the project root as `resonance-profile.yaml` (operator's call — left unlinked
so digs stay explicit about which facet they're weighted by).

## The profiles

| File | Resonant dimension | The pull |
|------|-------------------|----------|
| `00-purupuru.yaml` | **Master** — the whole-game fingerprint | what Purupuru *is*, and refuses to be |
| `01-elemental-tactics.yaml` | The battle core | lineup as a shrinking puzzle that re-solves every round |
| `02-burn-transcendence.yaml` | The mint→burn→transcend loop | completion over accumulation; burning as ascent |
| `03-daily-social-duel.yaml` | Async friend duels | the friend's ghost across the table; Wordle, not a ladder |
| `04-agent-layer.yaml` | Soul-stage cards as agents | the game that is already agent-shaped |
| `05-feel-first-no-numbers.yaml` | The no-dashboard aesthetic | feel the tide, never read the number |
| `06-live-world-meta.yaml` | Cosmic weather | a meta you can't solve because reality shifts it first |

## Format

Each follows the K-hole `resonance-profile.template.yaml` core fields
(`keywords` / `references` / `touchstones` / `aesthetic`), extended where the
pitch demands with `prohibited` (what the dimension refuses) and `comps`
(pitch-stated comparables + why none quite fit). The whole file is injected as
raw text into the dig synthesis prompt — structure aids reading, not parsing.

**Reference provenance:** comps marked `[pitch]` are operator-authoritative
(named in the pitch verbatim). Comps marked `[candidate]` are agent-proposed
taste-anchors — well-known works, but the operator should ratify before they
carry weight.

## Status

`candidate` — derived faithfully from the pitch, but the operator should review
the slicing (are these the right 6 dimensions?) and ratify the `[candidate]`
references before these become the standing calibration.
