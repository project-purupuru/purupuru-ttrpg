# Pre-Demo Checklist · run before recording 2026-05-11

> **Purpose**: a single doc the operator runs through before demo recording. Bundles env setup · validation steps · the irreversible freeze command · capture list · and known-good vs known-broken state. Goal: zero "wait, did I…?" moments at recording time.
>
> **As of**: 2026-05-09 · post sprint-3 T1+T2 commit `6ce7f1e`. Re-validate everything below if you've made code changes since.

---

## 1 · Vercel env vars · CRITICAL

Sprint-3 T2 introduced ONE new required env var: `QUIZ_HMAC_KEY`. Without it, the live Vercel deploy will return 500s on every quiz request because the renderer can't sign mac states.

### Generate it once

```bash
openssl rand -hex 32
```

This prints 64 hex chars = 32 bytes. Copy the output — that's your value.

### Paste into Vercel

> **2026-05-09 update**: The Vercel project for the quiz Blink moved from `purupuru-blink` (now zerker's observatory) to a NEW project **`purupuru-quiz`** at `https://purupuru-quiz.vercel.app`. Env vars must be set on the **new** project.

1. Open https://vercel.com/0xhoneyjar-s-team/purupuru-quiz/settings/environment-variables
2. Click **Add New**
3. Name: `QUIZ_HMAC_KEY`
4. Value: paste the 64-hex-char output from step 1
5. Apply to: **Production · Preview · Development** (all three)
6. Save
7. **Trigger a fresh deploy** (env changes don't apply to existing deployments)
   - Easiest: push a no-op commit, OR use Vercel UI → "Redeploy" on latest commit

### Same value in `.env.local`

Make sure your local `.env.local` has the SAME value so dev mirrors prod:

```bash
echo "QUIZ_HMAC_KEY=<paste 64-hex from step 1>" >> .env.local
```

### Full env-var inventory · verify all present in Vercel

| Var | Where it's used | Sample/format |
|---|---|---|
| `CLAIM_SIGNER_SECRET_BS58` | mint route + anchor tests | base58 64-byte ed25519 secret · must derive `E6E69osQmgzpQk9h19ebtMm8YEkAHJfnHwXThr6o2Gsd` |
| `SPONSORED_PAYER_SECRET_BS58` | mint route fee-payer | base58 64-byte Solana keypair · ≥0.05 SOL devnet |
| `QUIZ_HMAC_KEY` | **NEW** · quiz state HMAC | 64 hex chars (32 bytes) |
| `KV_REST_API_URL` | nonce store | auto-set by Vercel KV |
| `KV_REST_API_TOKEN` | nonce store | auto-set by Vercel KV |
| `SOLANA_RPC_URL` | mint route RPC | optional · defaults to `https://api.devnet.solana.com` |

### Verify it worked

After redeploy, quickly hit the start endpoint:

```bash
curl -s https://purupuru-quiz.vercel.app/api/actions/quiz/start | jq .title
```

Expected: a non-empty quiz question title (the Q1 prompt). If you get `"Catching our breath"` instead, the env still isn't applied — check var spelling and that you triggered a fresh deploy.

---

## 2 · Smoke test the mint route (script-driven · no UI)

Sanity-check the route assembles a valid tx WITHOUT having to take the full 8-question quiz:

```bash
# Local dev
pnpm dev  # in another terminal
pnpm tsx scripts/sp3-mint-route-smoke.ts

# Or against live Vercel
BASE_URL=https://purupuru-quiz.vercel.app pnpm tsx scripts/sp3-mint-route-smoke.ts
```

Expected output:
```
→ Smoke test against: https://purupuru-quiz.vercel.app
✓ Signed HMAC: <16 hex chars>...
✓ Test user wallet: <pubkey>
→ POST .../mint/genesis-stone?a1=...&mac=...
← 200 OK
✓ Got base64 tx (~1500 chars)
✓ Reveal message: "..."

--- Tx structure ---
  feePayer: <sponsored-payer pubkey>
  instructions: 2
    [0] Ed25519SigVerify111111111111111111111111111 · 0 accounts · 144B data
    [1] 7u27WmTz2hZHvvhL89XcSCY3eFhxEfHjUN5MjzMY6v38 · 9 accounts · 100B data

✓ Sponsored-payer signed
✓ Tx has 2 server-side signature(s) attached
✓✓✓ Smoke test passed · route is wired end-to-end
```

If smoke test FAILS:
- `✗ QUIZ_HMAC_KEY not in env` → fix env (section 1)
- `✗ Non-200 response` → check the error message · usually env or KV
- `✗ Expected first ix to be Ed25519Program` → tx assembly is broken · regression in sprint-3 T1 code
- 503 with "balance insufficient" → top up sponsored-payer (`solana airdrop 1 <pubkey> --url devnet`)

---

## 3 · Live e2e on `/preview`

Once smoke passes, do the real walk-through:

1. Go to `https://purupuru-quiz.vercel.app/preview`
2. Connect Phantom (devnet)
3. Click "What's My Element?"
4. Answer Q1-Q8
5. Reveal card shows: `You are <Element>.` + reveal copy + 2 buttons
6. Click "Claim Your Stone"
7. Phantom prompts to sign (3 sigs visible: payer, mint, your authority)
8. Confirm
9. Wait ~5-15s
10. Open Phantom → Collectibles tab → see "Genesis Stone · <Element>" with the stone PNG

If anything misses:
- No Phantom prompt → DevTools console · likely `[mint-error]` log
- Phantom prompt but tx fails on submit → check Solana Explorer for the failing sig · look for ErrorCode (ElementOutOfRange etc) in tx logs
- Tx confirms but no NFT in collectibles → wait 30s · Phantom caches metadata · refresh
- NFT appears but no image → `public/art/stones/<element>.png` reachable? curl the URL

---

## 4 · Upgrade-authority freeze · IRREVERSIBLE · run AFTER section 3 passes

Per PRD §FR-3 + flatline-r2 SKP-005 · before public demo · freeze the program upgrade authority so an attacker can't push a malicious version over our address.

```bash
solana program set-upgrade-authority \
  7u27WmTz2hZHvvhL89XcSCY3eFhxEfHjUN5MjzMY6v38 \
  --final \
  --keypair ~/.config/solana/id.json \
  --url devnet
```

You'll be prompted to confirm. Type the confirmation phrase exactly.

After this:
- Program ID is permanently bound to current bytes
- Any bug discovered post-freeze requires a fresh deploy with a NEW program ID
- Updating the new program ID would touch: `lib.rs:51` `declare_id!` · `Anchor.toml` × 2 · `lib/blink/anchor/program.ts:13` · `lib/blink/anchor/purupuru_anchor.types.ts:7` · `programs/purupuru-anchor/tests/sp2-claim.ts` · the issue body of project-purupuru/purupuru-ttrpg#5

**DO NOT freeze if smoke test or e2e test is still failing.** Once frozen there's no patch path.

---

## 5 · Demo recording capture list

Things to show in the demo video (3-min target):

### Story arc
1. Land on `/preview` (or actions.json registry surface)
2. "What's My Element?" → quiz cards · 8 questions · pretty
3. Reveal card → "You are Wood." + stone PNG visible in card icon
4. "Claim Your Stone" → Phantom prompt
5. Sign → tx confirms
6. Phantom collectibles tab → stone NFT visible

### Tech credibility moments
- Solana Explorer view of the deployed program at `7u27WmTz...`
- The tx after mint · show the two instructions (Ed25519 + claim_genesis_stone)
- The NFT metadata fetched from `purupuru-blink.vercel.app/art/stones/<element>.png`
- The `StoneClaimed` event in the tx logs (zerker indexer hook)

### Voice + framing punchlines
- "substrate truth ≠ presentation" (separation-as-moat)
- "the stone is the on-chain artifact · the awareness layer reads it back"
- "honest about scope · indexer integration is zerker's lane post-anchor-deploy"

---

## 6 · Known-good vs known-broken state · 2026-05-09

| Surface | State | Notes |
|---|---|---|
| Quiz Blink end-to-end | ✅ wired | T1+T2 committed at 6ce7f1e · pending live e2e validation |
| Anchor program on devnet | ✅ deployed | `7u27WmTz...` · 6/6 invariant tests green · upgrade-auth NOT yet frozen |
| Stone art (5 PNGs) | ✅ live | Gumi-delivered · 1350×1350 · served from `/art/stones/` |
| Result reveal · plain-language copy | ✅ shipped | "tide" stripped · operator-validated |
| Vercel deploy | ✅ live | `https://purupuru-quiz.vercel.app` |
| Zerker indexer | 🔴 not built | issue #5 filed · zerker's lane · not blocking demo |
| Score dashboard view | 🔴 not built | downstream of indexer · post-anchor-deploy |
| Demo simulator (FR-11) | 🔴 not built | post-recording video acceleration is the 0d fallback |
| Upgrade-auth freeze | 🔴 not run | section 4 above · post-validation |
| `BLINK_DESCRIPTOR` upstream PR (FR-2) | 🔴 deferred | post-hackathon |
| IP rate limit / sybil checks | 🔴 deferred | post-hackathon |

---

## 7 · If something breaks during recording

Pre-recording, top up sponsored-payer to >5 SOL devnet so a few demo claims won't drain it:

```bash
solana airdrop 1 <SPONSORED_PAYER_PUBKEY> --url devnet
# Repeat 5x · airdrops are rate-limited to 1 SOL/req on devnet
```

If rate limit is hit, transfer from your funded id.json:

```bash
solana transfer <SPONSORED_PAYER_PUBKEY> 5 --url devnet --keypair ~/.config/solana/id.json
```

If the live route returns 500 mid-recording:
- Don't panic-debug · pause recording
- `vercel logs` (or check Vercel dashboard) for the `[mint-error]` line
- 99% of cases: env var typo or sponsored-payer drained

---

## 8 · After recording

- Update README to match what was actually shipped (vs PRD spec)
- Tag the commit you recorded against (e.g. `git tag -a demo-2026-05-11 -m "..."`)
- Push tag so the deck can link to it
- Submission deck final pass

Post-hackathon · the gap-map at `grimoires/loa/context/prd-gap-map.md` is your post-mortem todo list for the v0 → v1 hardening cycle.
