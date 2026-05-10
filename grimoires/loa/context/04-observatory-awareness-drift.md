# Observatory ↔ Awareness-Layer-Spine · Drift Report

> Reference doc · cross-session use · captures what the observatory UI on `feature/observatory-v0` shows today vs. the canonical event/voice/asset surface that gumi + soju have shipped on `feat/awareness-layer-spine` (commits through `b56deb89`, 2026-05-09).
>
> Authored 2026-05-09 by zerker + Claude, reading both branches without checkout (observatory branch was mid-iteration in another session).

---

## TL;DR

| Layer | Observatory branch (today) | Awareness branch (canonical) | Drift |
|---|---|---|---|
| Action vocabulary | `mint` / `attack` / `gift` | `MintEvent` / `WeatherEvent` / `ElementShiftEvent` / `QuizCompletedEvent` | **2 of 3 actions don't exist; 3 real events not represented** |
| Element casing | lowercase `"wood"…` | uppercase `"WOOD"…` | naming convention |
| Element order | `wood, fire, earth, water, metal` | `WOOD, FIRE, EARTH, METAL, WATER` (canonical wuxing) | order |
| Archetype copy | none | 5 gumi/ARTISAN reveals | observatory has no reveal surface yet |
| Stone art | 5 PNGs at `public/art/elements/` (recent refresh) | 5 PNGs at `public/art/stones/` referenced from on-chain metadata | parallel asset trees · separate by design (resolved §6) |
| Weather oracle | `precipitation` + `cosmic_intensity` + `amplificationFactor` | `dominantElement` + `generativeNext` + `oracleSources` (`TREMOR \| CORONA \| BREATH`) | meteorological vs wuxing-cosmology vocabulary |
| Score distribution | matches | matches | aligned |

---

## 1 · Data vocabulary drift (highest priority)

`lib/activity/types.ts:13` claims authority from "PRD §4 F4.2 (tight 3)." That's a pre-r6 PRD revision. PRD r6 + SDD r2 + the actual `WorldEvent` schema on awareness branch (`packages/peripheral-events/src/world-event.ts:32`) define **4 variants**, none of which are `attack` or `gift`.

### What our mock generator emits today (`lib/activity/mock.ts:46`)

```ts
const KINDS: ActionKind[] = ["mint", "attack", "gift"];
// + targetElement set when kind is attack or gift
```

### What the canonical schema defines

| `WorldEvent._tag` | Carries | On-chain? | Observatory match? |
|---|---|---|---|
| `MintEvent` | `ownerWallet`, `element`, `weather`, `stonePda` | yes (devnet · `claim_genesis_stone`) | partial — we emit `mint` but no `weather` field, no `stonePda` |
| `WeatherEvent` | `day`, `dominantElement`, `generativeNext`, `oracleSources[]` | no | none — observatory has a separate `lib/weather` model with different vocabulary |
| `ElementShiftEvent` | `wallet`, `fromAffinity`, `toAffinity`, `deltaElement` | no | none — observatory has no concept of affinity transitions |
| `QuizCompletedEvent` | `archetype` only | no | none — observatory has no quiz signal |

**Net effect**: ~67% of activity-rail entries today (`attack` + `gift`) reference actions soju cannot back with on-chain or off-chain truth, even at demo time. The genesis-stone collection is the only mutating verb in the world.

### Element-name casing + order

- Observatory: `"wood" | "fire" | "earth" | "water" | "metal"` (`lib/score/types.ts:6`)
- Awareness: `"WOOD" | "FIRE" | "EARTH" | "METAL" | "WATER"` (`packages/peripheral-events/src/world-event.ts:11`)

The wuxing tie-break on the awareness branch follows canonical-wuxing — `WOOD > FIRE > EARTH > METAL > WATER`. Worth matching the canonical order so any rotation/cycle math agrees.

---

## 2 · Voice / copy drift

The awareness branch has gumi-authored, ARTISAN-polished voice for the quiz Blink. The observatory has none of these strings — but the FocusCard and any future archetype surface will need them to feel cohesive with what users see in the Blink.

**Archetype reveals** (`packages/medium-blink/src/voice-corpus.ts`, `ARCHETYPE_REVEALS`):

```
WOOD  → "You start things. You grow into what's next."
FIRE  → "You move quick. You light up the room."
EARTH → "You stay steady. People find their ground with you."
METAL → "You see clearly. You cut through noise."
WATER → "You flow with what moves. You feel before you think."
```

**Ambient prompt** (`AMBIENT_PROMPT`): `"the world breathes. take a moment with it."`

**Quiz corpus**: 8 questions × 3 hand-picked answers. Personality-test register, not poetic — recent ARTISAN commit `b56deb89` explicitly stripped the "tide" metaphor that observatory still uses freely. Compatible with observatory's existing register split (per memory `feedback_observatory_register.md`): rail/canvas can stay metaphorical, reveal copy is grounded.

If the observatory ever surfaces an archetype (e.g., a "your element" hover state on FocusCard, or a sprite-tooltip on the user's own pentagram vertex), pull these strings rather than invent parallel copy.

---

## 3 · Asset drift

| Path | Source | Used by |
|---|---|---|
| `public/art/elements/{wood,fire,earth,metal,water}.png` | observatory `5cbe3a6e` (refreshed) | Pentagram canvas vertex art |
| `public/art/stones/{wood,fire,earth,metal,water}.png` | awareness branch (gumi) | Stone reveal card · on-chain NFT image · referenced from `fixtures/stones/{element}.json` |

**Resolution (zerker, 2026-05-09)**: keep separate. Vertex art (the *element*, abstract) and stone art (the *claimable artifact*, concrete) are conceptually distinct surfaces. Observatory's vertex icons stay in `public/art/elements/`; stone PNGs live in `public/art/stones/` and reach observatory only via the FocusCard reveal flow if/when added.

The on-chain stone metadata embeds gumi's PNG directly:

```json
"image": "https://purupuru-blink.vercel.app/art/stones/fire.png"
```

So: a future FocusCard archetype reveal MUST source the stone PNG (so what's shown matches what lands in Phantom collectibles), but the pentagram vertex glyphs MUST stay on the existing observatory asset tree.

---

## 4 · Weather model drift

Observatory's `lib/weather/types.ts` is meteorological-leaning:

```ts
WeatherState {
  temperature_c, precipitation, cosmic_intensity,
  amplifiedElement, amplificationFactor,
  observed_at, location, source, sunrise?, sunset?, is_night?, temperature_unit?
}
```

Awareness's `WeatherEvent` is wuxing-cosmology-leaning:

```ts
WeatherEvent {
  day: string, dominantElement: Element,
  generativeNext: Element,                 // wuxing 生 sheng cycle
  oracleSources: ("TREMOR" | "CORONA" | "BREATH")[]
}
```

These aren't directly contradictory — observatory's weather model is *richer* (it carries IRL fields the awareness branch doesn't need for the Blink) — but they don't share keys. If/when zerker's indexer subscribes to a `WeatherEvent` stream (PRD r6 §F-4 mentions ElementShift derivation), the observatory tile derives its `amplifiedElement` from `dominantElement`, and could expose `generativeNext` as a "next" indicator (the wuxing bar in KpiStrip is shaped to support it).

**Notable hook**: `oracleSources` lists `TREMOR | CORONA | BREATH` — gumi pitched 5 oracle sources, only 3 are named so far. This is real lore the observatory weather tile could surface as ambient attribution ("read by tremor + corona") if you want the cosmology to feel sourced rather than synthetic.

---

## 5 · UI surface drift (where data drift lands)

| UI surface | File | Drift impact |
|---|---|---|
| ActivityRail rows | `components/observatory/ActivityRail.tsx` | Drop `attack`/`gift` row variants; add `quiz_completed`, `element_shift`, `weather` rendering — full scope of on-chain + off-chain activity per resolution §6 |
| FocusCard | `components/observatory/FocusCard.tsx:1` | If/when archetype is surfaced, pull copy from `ARCHETYPE_REVEALS` and stone PNG from `public/art/stones/` |
| Pentagram canvas effects | `components/observatory/PentagramCanvas.tsx` | Migration trails (mint sub-effect) stay; any "attack" effect becomes orphan; consider `element_shift` migration trail as primary motion source |
| KpiStrip wuxing bar | `components/observatory/KpiStrip.tsx` | Already aligned — uses `ElementDistribution` which awareness branch's score adapter also returns |
| WeatherTile | `components/observatory/WeatherTile.tsx` | If wiring to canonical `WeatherEvent`, surface `dominantElement`, `generativeNext`, optionally `oracleSources` |

---

## 6 · Resolutions (zerker, 2026-05-09)

1. **Asset trees**: keep `public/art/elements/` and `public/art/stones/` separate. Vertex art (pentagram glyphs) and stone art (claimable artifact) are distinct surfaces by design.
2. **ActivityRail scope**: surface *both* on-chain and off-chain activity to showcase the full scope of the awareness layer. All 4 `WorldEvent` variants get rail rendering — this is the demo's narrative beat ("the world has people in it").
3. **Indexer wiring (sprint-3 zerker lane)**: aspirational. Real-time indexed `StoneClaimed` events feeding the observatory is ideal but gated on hackathon time budget. If we don't get there, observatory stays on synthetic data and the demo recording acknowledges the indexer as v1.

---

## 7 · Recommended alignment scope (smallest viable)

In dependency order:

1. **`lib/activity/types.ts` + `lib/activity/mock.ts`** — swap action vocabulary to the 4 `WorldEvent` variants. Single commit.
2. **`lib/score/types.ts`** — decision: keep observatory casing internal (lowercase) and convert at the awareness boundary if/when an indexer arrives, OR canonicalize to uppercase + canonical-wuxing order now. The boundary-conversion path is lower-risk for the observatory branch in isolation.
3. **`ActivityRail.tsx` row variants** — replace `attack`/`gift` with `quiz_completed` + `element_shift` + `weather` per resolution §6.2. Rail copy register stays metaphorical (per memory `feedback_observatory_register.md`).
4. **Reference (don't surface yet)**: gumi's archetype reveal copy + canonical stone PNG path documented in this report as the source of truth. Guards against inventing parallel copy in a later UI iteration.
5. **Defer**: weather model fusion. The two models can coexist until the indexer is real; converting now means inventing fields the observatory tile doesn't need yet.

---

## 8 · What's NOT drift (already aligned)

- Element vocabulary (modulo casing) — same 5 wuxing elements
- `ElementDistribution` shape — same `Record<Element, number>` contract
- Mocked-first posture — both sides accept env-flag flip to real adapters later
- Score read-side as ambient backdrop, not foreground — both sides treat Score the same way

---

## Sources (for re-reading without checkout)

```bash
git show origin/feat/awareness-layer-spine:packages/peripheral-events/src/world-event.ts
git show origin/feat/awareness-layer-spine:packages/medium-blink/src/voice-corpus.ts
git show origin/feat/awareness-layer-spine:programs/purupuru-anchor/programs/purupuru-anchor/src/lib.rs
git show origin/feat/awareness-layer-spine:fixtures/stones/fire.json
git show origin/feat/awareness-layer-spine:app/api/actions/today/route.ts
git show origin/main:grimoires/loa/sprint.md
git show origin/main:grimoires/loa/context/01-prd-r6-integration.md
```
