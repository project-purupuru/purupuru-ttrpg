---
type: user-truth-canvas
slug: pre-demo-walkthrough
date: 2026-05-11
operator: zerker (zksoju)
status: in-progress
journey: Feed tile → 8-Q quiz → "You are Wood." → wallet sig → Observatory lobby
proofs: [discovery-outside-app, quiz-creates-identity, wallet-trust-crossing, observatory-not-alone]
session: 4
composes_with:
  - grimoires/loa/specs/enhance-demo-polish-2026-05-11.md
  - grimoires/loa/context/05-pre-demo-checklist.md
  - grimoires/loa/context/06-user-journey-map.md
---

# Pre-Demo Walkthrough — Witness QA · 2026-05-11

> Operator-facing real-interaction QA checklist · bridges "merged" to "true in the world." Walk top to bottom · check boxes as you go · capture observations in the **OBSERVED** slots · stop and triage on first FAIL.

> **Stop-the-line rule**: any FAIL in §1–§4 halts the next phase. §5 (freeze) is **irreversible** — only run when §1–§4 all pass.

---

## §0 · Pre-flight context

| Item | Value |
|---|---|
| Vercel project | **`purupuru`** (renamed from `purupuru-blink` · `purupuru-quiz` deleted) |
| Production domain | `https://purupuru.world` (apex · live) |
| Twitter Blink share URL | `https://purupuru.world/quiz` |
| Observatory URL | `https://purupuru.world/` |
| In-browser preview | `https://purupuru.world/preview` |
| Anchor program ID | `7u27WmTz2hZHvvhL89XcSCY3eFhxEfHjUN5MjzMY6v38` |
| Sponsored payer pubkey | `9CsHibNHtNfH94a3VKzqnMmFdkpJNqh312RAsS9TL5Ph` · **1 SOL devnet · airdrop rate-limited** |
| Claim signer derived | matches expected — smoke test green |
| KV nonce store | Upstash Redis · auto-linked via Vercel Marketplace |
| Phantom network | **devnet** (settings → network) |
| Smoke test | ✓ passed against live · 2-instruction tx · sponsored-payer signed · replay-protection live |
| Time budget | ~10min recording remaining

---

## §1 · DNS + project consolidation (parallel · DNS doesn't block recording but Vercel cleanup does)

This repo deploys to ONE Vercel project (`purupuru-quiz`) that serves BOTH observatory (`/`) and Blinks (`/quiz`, `/preview`, `/today`). DNS propagation is 1–60min · start it early so it's ready at recording. Fallback share URL during propagation: `https://purupuru-quiz.vercel.app/quiz`.

### 1.1 · Delete orphan Vercel project

- [ ] Vercel UI → `purupuru-blink` → Settings → Advanced → **Delete Project**
- [ ] Confirm no production traffic was hitting it (the old observatory is now `/` in this repo)

### 1.2 · Add apex `purupuru.world` to `purupuru-quiz`

- [ ] Vercel UI → `purupuru-quiz` → Settings → Domains → **Add Domain** → `purupuru.world`
- [ ] At DNS provider · add `A` record: `@` → `76.76.21.21`
- [ ] (optional) `www.purupuru.world` → `CNAME` → `cname.vercel-dns.com.`
- [ ] Vercel UI shows "Valid Configuration" + SSL cert provisions

**OBSERVED**:
- propagation time:
- any redirect / SSL issues:

### 1.3 · Verify domain resolves

```bash
curl -I https://purupuru.world
curl -I https://purupuru.world/quiz | head -5
```

- [ ] apex returns 200/308 with valid cert
- [ ] `/quiz` returns 200 with `Content-Type: application/json` (or HTML wrapper)

**OBSERVED**:
- curl status apex:
- curl status /quiz:

### 1.4 · Post-recording sweep (NOT blocking)

After recording lands: one PR sweeping `grimoires/vocabulary/lexicon.yaml` + `README.md` + any other `*-quiz.vercel.app` / `*-blink.vercel.app` references to `purupuru.world`. Not in the recording path.

- [ ] queued for follow-up PR

---

## §2 · Env vars on Vercel `purupuru-quiz` (build doc § Operator Runway #1)

The mint route 500s without these. The 500 is friendly to the user but breaks demo flow.

### 2.1 · Verify required vars are present + correct

Vercel → `purupuru-quiz` → Settings → Environment Variables. Confirm presence + value sanity:

- [ ] `CLAIM_SIGNER_SECRET_BS58` — must derive `E6E69osQmgzpQk9h19ebtMm8YEkAHJfnHwXThr6o2Gsd`
- [ ] `SPONSORED_PAYER_SECRET_BS58` — base58 64-byte keypair
- [ ] `QUIZ_HMAC_KEY` — 64 hex chars (32 bytes) · session-3 introduced
- [ ] `KV_REST_API_URL` — auto-set by Vercel KV
- [ ] `KV_REST_API_TOKEN` — auto-set by Vercel KV
- [ ] **`NEXT_PUBLIC_APP_URL=https://purupuru.world`** ← UPDATE (was pointing at `purupuru-quiz.vercel.app`)
- [ ] **`OBSERVATORY_URL=https://purupuru.world`** ← **NEW** · post-mint `links.next` bridge target · currently defaults to old `purupuru-blink.vercel.app` if unset

### 2.2 · If any are missing

- [ ] Generate `QUIZ_HMAC_KEY` if missing: `openssl rand -hex 32`
- [ ] Paste secrets into Vercel (Production · Preview · Development)
- [ ] **Trigger fresh deploy** — env changes don't apply to existing deployments

### 2.3 · Quick endpoint smoke

```bash
# After DNS lands · use apex
curl -s https://purupuru.world/api/actions/quiz/start | jq .title

# Or pre-DNS · use vercel.app
curl -s https://purupuru-quiz.vercel.app/api/actions/quiz/start | jq .title
```

- [ ] Returns a non-empty Q1 prompt (NOT `"Catching our breath"` · that's the friendly error)

**OBSERVED**:
- title returned:
- any env still missing:

---

## §3 · Sponsored-payer top-up (build doc § Operator Runway #2)

```bash
solana airdrop 1 <SPONSORED_PAYER_PUBKEY> --url devnet
# repeat 5× · rate-limited 1 SOL/req
# OR: solana transfer <PUBKEY> 5 --url devnet --keypair ~/.config/solana/id.json
```

- [ ] Balance ≥ 1 SOL devnet · ideally 5+ for demo + retries
- [ ] `solana balance <SPONSORED_PAYER_PUBKEY> --url devnet` confirms

**OBSERVED**:
- balance pre:
- balance post:
- airdrop rate-limit hit?:

---

## §4 · Live walk-through · 4 proofs · the witness pass

This is the QA pass — the part construct-witness owns. **Walk through end-to-end on a fresh browser + fresh Phantom wallet** to simulate cold audience.

### Prep
- [ ] Phantom switched to **devnet**
- [ ] Browser dev tools open (network tab + console) for diagnostic capture
- [ ] Fresh test wallet (not the demo wallet) for first dry-run · save demo wallet for recording
- [ ] Burner X account ready · NOT logged in yet · open as second tab

### Proof #1 · Discovery outside the app

**Action**: post `https://purupuru.world/quiz` to burner X · watch the unfurl
(Fallback if DNS not propagated: `https://purupuru-quiz.vercel.app/quiz`)

- [ ] Twitter renders Blink unfurl (NOT plain link)
- [ ] Headline / button copy reads as world-language (not "test")
- [ ] If unfurl is broken: fallback recording path = dial.to (degraded · ROSENZU flag stands)

**OBSERVED**:
- unfurl rendered?:
- copy that appeared:
- screenshot saved at:

### Proof #2 · Quiz creates identity (Q1 → reveal)

**Action**: tap "What's My Element?" → answer Q1 through Q8 → land on reveal

- [ ] 8 questions present · each renders quickly (<800ms POST chain)
- [ ] Each question's illustration loads (q1.png–q8.png · bus-stop scenes)
- [ ] Step indicator reads sensibly (currently "Question N of 8" · atmospheric variant in build doc § Yellow — skip if not shipped)
- [ ] Reveal shows: `You are <Element>.` + 2-beat ARCHETYPE_REVEAL copy + stone PNG
- [ ] **Single CTA**: "Claim Your Stone" (no secondary CTA — WEAVER drop confirmed)
- [ ] Reveal copy lands as recognition, not fortune-telling (KEEPER frame)

**OBSERVED**:
- element revealed (test run):
- 2-beat reveal copy (verbatim):
- stone PNG visible?:
- any visual jank / FOUC / layout shift:

### Proof #3 · Wallet sig as trust crossing

**Action**: click "Claim Your Stone" → Phantom popup → sign → confirm

- [ ] Phantom popup appears within 2s
- [ ] Popup shows 3 sigs: payer, mint, user authority
- [ ] Tx confirms in 5–15s (devnet variability)
- [ ] No 500s · no `[mint-error]` in browser console
- [ ] NFT visible in Phantom → Collectibles tab (may need ~30s metadata cache)
- [ ] Stone PNG renders in Phantom Collectibles (not broken image)

**Voiceover line to confirm operator-side**: *"Cross the bridge. Claim your stone."* — read this aloud during recording at sig moment (KEEPER's only proof-#3 mitigation · Phantom chrome unfixable in v0).

**OBSERVED**:
- tx signature (Explorer link):
- time to confirmation:
- Collectibles tab cache wait:
- voiceover natural to land at sig moment?:

### Proof #4 · Observatory · "I am not alone"

**Action**: after mint · click post-mint `links.next` "See yourself in the world" → observatory loads

- [ ] One-tap bridge fires (no manual URL paste)
- [ ] Bridge lands on `https://purupuru.world/?welcome=<element>` (NOT old `purupuru-blink.vercel.app` · this verifies `OBSERVATORY_URL` env applied)
- [ ] **At 5s mark**: welcome fixture fires · seeded JoinActivity arrives on rail with operator's just-minted stone
- [ ] Activity rail TICKS during 30s linger (not static · KEEPER + WEAVER both flagged motion is load-bearing)
- [ ] Pentagram canvas pans · sprites drift
- [ ] Click a sprite · focus card opens · outside-click closes
- [ ] Music + day/night theme present (atmospheric register intact)

**OBSERVED**:
- welcome fixture fire time (s):
- rail motion during linger:
- focus card behavior:
- music / theme present:
- the "not alone" feel land?:

---

## §5 · Upgrade-authority freeze · **IRREVERSIBLE** · build doc § Operator Runway #5

> Only run AFTER §1–§4 all pass. Once frozen, any bug needs a new program ID + cascade of address updates across lib.rs · Anchor.toml × 2 · program.ts · types.ts · sp2-claim.ts · issue #5 body.

```bash
solana program set-upgrade-authority \
  7u27WmTz2hZHvvhL89XcSCY3eFhxEfHjUN5MjzMY6v38 \
  --final \
  --keypair ~/.config/solana/id.json \
  --url devnet
```

- [ ] §4 walk-through fully passed (no checkbox unchecked above)
- [ ] Operator types the confirmation phrase
- [ ] Solana CLI confirms freeze
- [ ] Tag commit: `git tag -a demo-2026-05-11 -m "recorded against this commit"`

**OBSERVED**:
- freeze tx signature:
- tag created at commit:

---

## §6 · Dialect registry submit (build doc § Operator Runway #6)

Parallel · doesn't block. Submits the Action to Dialect for registry-blessed unfurl (removes dial.to banner if approved before recording · 1–5 day review window).

- [ ] Visit https://docs.dialect.to/blinks-getting-started/registry
- [ ] Submit Action URL: `https://purupuru-quiz.vercel.app/preview` (or `blink.purupuru.world/preview` if §1 DNS live)
- [ ] Note submission timestamp + ref ID

**OBSERVED**:
- submission ref:
- timestamp:

---

## §7 · Post-walk synthesis (fill after §1–§6 close)

### Gap list (anything that surprised · failed · or felt off)
-

### Felt-quality notes (atmospheric register · proof landing strength)
- Proof #1 strength:
- Proof #2 strength:
- Proof #3 strength (with voiceover):
- Proof #4 strength:

### Ready to record?
- [ ] All §4 checkboxes ticked
- [ ] §5 freeze complete
- [ ] No outstanding gaps blocking the demo arc
- [ ] Recording setup staged (screen recorder · burner X tab · Phantom on devnet · audio level checked)

### Recording artifacts (fill after recording)
- recorded against commit:
- recording file at:
- duration:
- voiceover landed cleanly?:
- one-thing-I-would-redo:

---

## §8 · Downstream consumers (post-recording)

Once filled, this UTC seeds:

- **construct-observer · KEEPER**: gap list feeds the post-launch issue triage
- **construct-herald**: voice / phrasing observations feed announcement draft
- **construct-gtm-collective**: proof-landing strength informs deck framing
- **Eileen / Gumi review**: §7 felt-quality notes are the operator's honest read pre-handoff
