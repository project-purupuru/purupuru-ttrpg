# Session 4 · Upstream Distillations · 2026-05-11

> Operator directive: distill **generalizable** learnings from session 4 for upstream contribution to the construct registry. Do NOT distill project-specific facts. Focus on patterns + workflows + gotchas that future operators + agents will hit elsewhere.

## What worked well (worth canonizing)

### 1. Parallel construct invocation discipline

**Pattern**: when an audit requires multiple lenses (material + spatial + emotional + structure + voice), fire 2-4 constructs **in parallel via `run_in_background: true`**, give each an explicit lens boundary, and synthesize on return.

**Used twice in this session, both landed clean:**
- R5 demo audit: KEEPER (emotional) + ALEXANDER (craft) + ROSENZU (spatial) → 3 distinct verdicts, 0 duplicate work, ~30s wall time
- OG metadata strategy: BEACON (structure) + ALEXANDER (copy) → 2 distinct verdicts, structure + copy separated cleanly

**Why it works**: lens-explicit boundaries prevent overlap; parallel runtime amortizes the wait; synthesis pass is mechanical (collect SHIP-BLOCKING/RECOMMENDED/POST-SHIP triage).

**Upstream candidate**: codify in `loa-constructs` or framework docs as a **parallel-audit pattern** — when to use, how to bound lenses, expected output structure.

**Receipt format observed working**:
```json
{
  "construct_slug": "...",
  "output_type": "Verdict",
  "verdict": { "summary": "..." },
  "invocation_mode": "agent" | "studio" | "room",
  "persona": "ALEXANDER" | "KEEPER" | ...,
  "output_refs": [...],
  "evidence": [{"path": "...", "ref": "..."}]
}
```

### 2. SHIP-BLOCKING / SHIP-RECOMMENDED / POST-SHIP triage

**Pattern**: every construct audit must mark each finding with one of three tiers. Makes synthesis trivial and prioritization automatic.

**Where this saved time**: KEEPER R5 audit returned 5 findings; 1 was SHIP-BLOCKING (Phantom popup copy), 2 were SHIP-RECOMMENDED, 2 were POST-SHIP. The operator could immediately see what blocked recording vs what could wait.

**Upstream candidate**: bake into `construct-observer` (KEEPER's pack) + `construct-artisan` (ALEXANDER's pack) + any audit-shaped construct as a required output field. Default to "POST-SHIP" if unclassified — never let an audit return ungraded findings.

### 3. Voice extraction grounded in canon artifacts (HERALD pattern)

**Pattern**: when an operator asks "embody X character/voice," call HERALD's `synthesizing-voice` skill with **the artifact paths** (lore JSON, character art, identity components). HERALD returns:
- Voice profile (≤80 words)
- N rewritten samples (post bodies / announcement copy / etc.)
- **Evidence trail**: every voice trait cites a specific artifact (file path + ref)

**Why it works**: voice extraction without canon grounding produces generic copy. HERALD's discipline ("every voice trait must trace to a specific artifact") forces fidelity.

**Upstream candidate**: this is `construct-herald`'s already canon — promote `synthesizing-voice` as the entry-point skill for any voice/persona authoring task. Add a precondition check: "are there canon artifacts? If not, ask for them before generating."

### 4. Dynamic OG via Next.js file convention

**Pattern**: for OG cards in Next.js 16+, use `app/opengraph-image.tsx` with `next/og` `ImageResponse`. Single file generates 1200×630 PNG server-side at edge runtime. Auto-routes at `/opengraph-image`. Auto-populates `og:image` + `twitter:image` for the root + all child routes (unless a route ships its own opengraph-image file).

**No external asset hosting needed** — replaces the brittle S3-hosted-card pattern that breaks when buckets go 403.

**Constraints to document**:
- Satori (the renderer behind `next/og`) supports only a subset of CSS
- **No `oklch()` colors** — use hex/rgb/hsl
- Limited gradient syntax (linear-gradient + radial-gradient OK)
- No transform animations
- Custom fonts require explicit `fonts` parameter (or fall back to default Inter)

**Upstream candidate**: add to `construct-beacon` as a **discoverability + OG pattern** doc. Could also live in a generic Next.js patterns construct.

### 5. UI-fidelity recreation with operator override of construct anti-patterns

**Pattern**: when recreating a high-fidelity third-party UI (X.com, Discord, etc.), the operator may **override** craft-construct anti-patterns ("don't use the blue / don't use the bird") in favor of fidelity.

**Workflow that worked in this session**:
1. Constructs return their pure-craft direction (ALEXANDER: "no blue, no logo, palette as disclaimer")
2. Operator overrides with the actual visual reference (screenshot of real X)
3. Build to the reference, not the spec
4. Iterate via direct annotation (Agentation toolbar) on the rendered result
5. Constructs come back in to refine details (not to push back on the override)

**Upstream candidate**: codify in `loa-constructs` as **"operator override discipline"** — when the operator overrides construct direction, agents should:
- Acknowledge the override explicitly in the next commit message
- NOT silently revert to construct direction in later iterations
- Mark the override as a project-level decision in track files

### 6. Agentation visual-feedback toolbar workflow

**Pattern**: install `agentation` (npm package) into the project's Next.js layout in dev-mode only. Operator annotates specific DOM elements directly in the browser. Annotations arrive as a structured feedback message:

```
### N. <element class>
**Location:** <CSS selector path>
**Source:** <chunk URL>
**Feedback:** <free-form text>
```

**Why it works**: ambiguity in spoken/typed feedback ("the padding here is wrong") gets resolved by the operator pointing at the element directly. The agent receives the exact selector + a typed instruction.

**Upstream candidate**: add an "Agentation install + workflow" doc to `loa-constructs` (the skill already exists — promote it). Pair with a pattern for: how agents should respond to Agentation feedback batches (re-annotate when ambiguous · don't guess).

## What was friction (worth fixing upstream)

### 1. Tailwind v4 + symlinks → Turbopack path-traversal crash

**Symptom**: dev server returns 500 on every page. Error: `FileSystemPath("project").join("../../../.loa/constructs/packs/...") leaves the filesystem root`.

**Root cause**: Tailwind v4 auto-detection follows symlinks. `.claude/constructs/packs/*` are symlinks to global pack locations (e.g., `~/.loa/constructs/packs/protocol/skills/abi-audit`). Auto-scan follows them and generates filesystem references that escape the project root. Turbopack rejects as a security measure.

**Fix**:
```css
@import "tailwindcss" source(none);
@source "../app/**/*.{ts,tsx,js,jsx,mdx}";
@source "../components/**/*.{ts,tsx,js,jsx,mdx}";
@source "../lib/**/*.{ts,tsx,js,jsx,mdx}";
@source "../packages/**/*.{ts,tsx,js,jsx,mdx}";
```

`source(none)` disables auto-detection. Explicit `@source` directives provide the whitelist.

**Upstream candidate**: add to **Loa framework docs** as a known interaction — projects using Loa constructs (with .claude/constructs symlinks) + Tailwind v4 must use explicit source whitelist. Could be a `mount-framework` post-install check or a docs page.

### 2. `vercel env pull` clobbers .env.local with empty strings

**Symptom**: after `vercel env pull`, sensitive env vars (CLAIM_SIGNER_SECRET, SPONSORED_PAYER_SECRET, QUIZ_HMAC_KEY) appear in `.env.local` as empty strings (`""`). Local dev breaks because the env preflight fails.

**Root cause**: Vercel sensitive env vars (set via `vercel env add --sensitive`) cannot be decrypted via the CLI. `vercel env pull` writes them as empty rather than skipping. The `.env.local` file is fully REPLACED, not merged.

**Mitigation patterns**:
1. **Backup before pull**: `cp .env.local .env.local.backup-$(date +%s)` before any `vercel env pull`
2. **Set sensitive-only**: when pushing to Vercel via CLI, mark only the truly-sensitive vars with `--sensitive`; non-sensitive ones (URLs, public config) leave unmarked so they pull cleanly
3. **Separate Development env on Vercel**: keep Production sensitive vars on Production env only; create non-sensitive Development versions of the same vars for local `vercel env pull` against Development environment
4. **Document the trade-off**: pulling production env into local dev is a one-way ratchet — once clobbered, irrecoverable without operator backup

**Upstream candidate**: add to **`construct-protocol` or framework docs** as a Vercel-CLI gotcha. Could also live in a generic "secrets management with Vercel" doc.

### 3. Satori (next/og) CSS subset

**Symptom**: `/opengraph-image` route returns empty reply / 500.

**Root cause**: Satori (the renderer behind `next/og`) doesn't support `oklch()` colors. Project tokens that use oklch fail silently.

**Fix**: convert all colors in opengraph-image.tsx to hex / rgb / hsl. Document the CSS subset Satori supports.

**Upstream candidate**: add to `construct-beacon` or a Next.js construct as known Satori limitations. Could include a `tokens-to-hex` helper that converts oklch tokens for OG card use.

### 4. AskUserQuestion option label truncation

**Symptom**: operator flagged option labels with long sentences get truncated in the UI.

**Pattern observed working**: keep label ≤30 chars (≤50 max) · lead with action verb · use `description` field for conditional clauses.

**Upstream candidate**: add to the operator-OS / question-prompts construct as a length rule. Could be enforced via a lint that warns on labels >50 chars.

## Meta-pattern: workflow shape that worked

Session 4 followed a repeated **construct-audit → operator-iterate → construct-refine** loop:

```
Operator framing (broad)
  ↓ spawn 2-4 constructs in parallel (lens-bounded)
Construct audit verdicts (with SHIP-BLOCKING triage)
  ↓ operator override / refine
Build to direction (with operator annotations via Agentation)
  ↓ commit + push
Construct re-audit (optional refinement loop)
  ↓
Ship
```

This loop is **fast** when the constructs are lens-bounded, parallel, and triage their findings. It **stalls** when constructs duplicate work or return ungraded laundry-lists.

**Upstream candidate**: codify as the **"R-cycle audit"** pattern. R3 / R4 / R5 audits in this project's history all used this shape. Standard naming (R1 = first audit, R2 = follow-up after build, etc.) helps trace audit history across commits.

## Files this session created that are upstream-portable

- `app/opengraph-image.tsx` — generic OG card template (just replace tokens + copy)
- `lib/seo/metadata.ts` — generic SEO metadata factory for Next.js 16
- `app/sitemap.ts` — generic sitemap pattern
- `public/llms.txt` — generic AI-readability manifest structure
- `app/quiz/page.tsx` / `app/today/page.tsx` — landing-page-with-Blink pattern

These could be turned into a Next.js + Loa starter pack or a `construct-next-seo` construct that scaffolds the lot.

## Next steps for operator routing

The operator can choose which upstream destinations to route each learning to. Suggested routing:

| Learning | Upstream destination |
|---|---|
| Parallel construct invocation discipline | `loa-constructs` framework docs OR `construct-the-loom` (composition browser) |
| SHIP-BLOCKING triage | `construct-observer` (KEEPER's lens) + `construct-artisan` (ALEXANDER's lens) — required output field |
| Voice extraction grounded in artifacts | `construct-herald` (already canon · promote pattern) |
| Dynamic OG via next/og | `construct-beacon` (discoverability) + Next.js patterns doc |
| UI-fidelity recreation + operator override | `loa-constructs` framework — "operator override discipline" |
| Agentation install + workflow | `loa-constructs` framework — promote agentation skill |
| Tailwind v4 + symlinks | Loa framework `mount-framework` post-install + docs |
| `vercel env pull` clobbering | `construct-protocol` or generic Vercel docs |
| Satori CSS subset | `construct-beacon` known-limitations |
| AskUserQuestion option labels | OperatorOS / question-prompts construct |
| R-cycle audit pattern | Loa framework docs · session/track conventions |

---

**Discipline note**: this distillation is intentionally project-agnostic. Specific paths in this repo are mentioned only as evidence-trail for where the patterns were observed. The upstream contributions should be generic and reusable.
