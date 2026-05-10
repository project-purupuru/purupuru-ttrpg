---
title: "purupuru-ttrpg — sonic taste foundation"
status: foundation-v0
authority: "@zksoju (creative-direction) · @gumi (lore + voice ratification) · the-speakers (method)"
construct_voice: "ALEXANDER (named principles) + TANDY's METHOD (vertical layers, signal precision) + Speakers (Suno discipline) — inverted habitat: honey-warm, not dark"
created: 2026-05-07
target: dashboard ambience · weather-bot continuity · 3min demo recording · post-hackathon score-dashboard bed
related_repos: project-purupuru/world (lore-bible authority) · project-purupuru/score (zerker dashboard) · purupuru-ttrpg (this repo)
inverts: ".claude/constructs/packs/the-speakers (Tandy's Sprawl/CRT atlas — wrong genre for Tsuheji)"
---

# purupuru-ttrpg — sonic taste foundation

> The Speakers' construct ships a Sprawl atlas (witch house, dark garage, hauntological-cold). Tsuheji is the inverse habitat: Ghibli-warm, honey-magic, painterly utopia. We borrow the construct's METHOD (5-layer vertical foundation, Suno 10-laws, sub-mono, ducking) and replace its REFERENCE ATLAS. This file authors the inversion.

---

## 0 · north star (one paragraph)

The music is **what Musubi Station sounds like at dawn**, before the bees start, when the chime hangs in the timber and the underground trains have stopped. It is not silence. It is **a room where bees are about to arrive**. Honey is not a flavor — it is a *resonance*: warm low-mids around 200–500 Hz, gentle compression that mimics terraced apiary hum, and never a hard edge. Wuxing is not a palette — it is a *cycle*: five element-coded breathing rhythms (4–6 seconds) inherited from `app/globals.css --breath-*` tokens. The music breathes in the same beat as the UI. When a card glows, the sub swells with it.

We are **Recorders, not Composers**. The world already sounds like this. We are documenting a place.

---

## 1 · the sonic origin myth (the load-bearing fragment)

From `lore-bible.md §2`:

> **Musubi Station's signature chime is said to be the oldest recorded melody in Tsuheji.**

This is the canonical anchor. Every dashboard sound, weather-bot post, archetype reveal — they all derive from variations on this chime. We never define the literal notes; we define its *rules*:

- **4–6 notes**, never more
- **pentatonic** (Yo or Hirajoshi mode — never minor-sad, never major-bright)
- **plays once, decays naturally** — no looped chime sting
- **timbre = struck wood + glass + felt** (mokugyo + glass armonica + felt-piano hammer) — never synthesized bell
- **felt before heard** — under -18 LUFS at the moment of play, peaks soft

Every other sound in this system is the chime *re-voiced*. That is the structural rule.

---

## 2 · the honey-warm reference atlas (inversion of `the-speakers` dark atlas)

The construct ships seven dark regions (Burial, Lustmord, Demdike Stare, Boards of Canada cold cuts). Tsuheji needs the parallel inversion. **These are the named references that activate narrow latent regions in our habitat:**

| region | named refs (max 2 per Suno prompt) | key tokens |
|---|---|---|
| **Hisaishi Pastoral** | Joe Hisaishi (*Spirited Away* "One Summer's Day"), Yoko Kanno (*Wolf's Rain* end credits) | Studio Ghibli score, felt piano + strings, hand-played |
| **Kankyō Ongaku** | Hiroshi Yoshimura (*Music for Nine Postcards*), Midori Takada (*Through the Looking Glass*) | environmental music, marimba, wood-block, room tone |
| **Pastoral Ambient** | Susumu Yokota (*Sakura*), Toshifumi Hinata (*Reflections*) | tape-degraded piano, jazz brushed drums, koto fragments |
| **Felt Modern** | Nils Frahm (*Says*), Ólafur Arnalds (*Saman*) | felt piano hammer, prepared piano, hiss, room tone |
| **Crystalline New Age** | Mort Garson (*Plantasia*), Laraaji (*Day of Radiance*) | zither, hand-rung bells, hammered dulcimer, glass armonica |
| **Asian Folk Electronic** | Hatis Noit (*Aura*), Kenji Kawai (*Ghost in the Shell* main theme — the chant) | shakuhachi, processed vocal, koto + sub, taiko felt-mallet |
| **Hauntological-Warm** | Boards of Canada (*Music Has the Right* — lower-bpm cuts only), Stars of the Lid (*And Their Refinement of the Decline*) | tape memory, soft drone, dissolved edges |

**Use sparingly.** The Speakers law: **max 2 named artists per Suno prompt.** Pick from this list, never reach outside it without explicit ratification by gumi.

### never-include list (genre poisons)

These tokens collapse the latent space toward Sprawl/cyberpunk/EDM and break the Tsuheji habitat:

- driving · banger · drop · build · epic · cinematic-trailer · orchestral-hit
- arpeggio · supersaw · sidechain · pluck · stab · lead · hook
- dark · brooding · sinister · ominous · industrial · mechanical · metallic
- neon · synthwave · vaporwave · cyberpunk · CRT · phonk · trap
- bright · crisp · clean · polished · radio-ready · pop

### always-prefer list (habitat reinforcers)

- *warm · felt · breathing · pastoral · sun-dappled · honey-lit · painterly*
- *unhurried · drift · hover · settle · waver · linger*
- *tape-warmth · cassette-flutter · field-recording · room-tone · hiss*
- *acoustic · played-by-hand · imperfect · close-mic · breath-audible*
- *modal (not minor-sad / not major-bright) · pentatonic · Mixolydian-flat-7*

---

## 3 · element-keyed sonic palette (the wuxing engine)

Five elements. Five breathing rhythms (locked in `app/globals.css`). Five voice registers. The dashboard listens to today's cosmic weather and selects the active element. Each element is a *chime variation* of the Musubi origin (§1).

| element | virtue | breath (CSS) | tempo | mode | core instruments | refs (pick 2 max) | felt-by |
|---|---|---|---|---|---|---|---|
| **wood (mù)** 木 | benevolence | `--breath-wood: 6s` | 70 BPM, half-time | Yo pentatonic, D | felt piano + koto + hammered dulcimer | Hisaishi · Yoshimura | morning-garden growth, dew, the moment before bees |
| **fire (huǒ)** 火 | propriety | `--breath-fire: 4s` | 80 BPM, light step | Mixolydian, F | marimba + brushed snare + warm tape strings | Yokota · Hinata | midday tea-steam, festival lanterns at noon, ceremony |
| **earth (tǔ)** 土 | fidelity | `--breath-earth: 5.5s` | 60 BPM, kickless drift | Hirajoshi, G | hang drum + felt piano + low pad | Frahm · Stars of the Lid | golden-hour clay, kiln-hum, brushstroke pause |
| **metal (jīn)** 金 | righteousness | `--breath-metal: 4.5s` | 75 BPM, crystalline pulse | Mixolydian-b7, Bb | glass armonica + music-box bells + soft sub | Garson · Laraaji | twilight bronze, pot lifted from kiln, polish-circle motion |
| **water (shuǐ)** 水 | wisdom | `--breath-water: 5s` | 65 BPM, granular drift | Iwato pentatonic, A | shakuhachi + tape-loop strings + sub-bass drone + processed vocal | Hatis Noit · Kawai (chant) | night observatory, deep-honey vision, water on stone |

**The breathing rule (load-bearing)**: every element's track contains a 4-bar phrase whose envelope follows `--breath-{element}` cycle. UI components on screen breathe at the same period via `@keyframes breathe-{element}`. The eye and the ear are entrained. If the CSS breath duration changes, the audio re-renders. **One source of truth: the CSS variable.**

### transition rule (cosmic weather shift)

When the daily weather oracle rotates element (wood → fire → earth → metal → water), the dashboard does NOT crossfade. It performs a **kasa break** (Tandy term, repurposed): for 2 bars, both elements play at -6 dB; on the down-beat of bar 3, the outgoing element vanishes (gain → 0 over 200ms), incoming element rises to 0 dB over 1.6 s with `--ease-puru-settle`. This is the audio-side of the wuxing cycle.

---

## 4 · the old hōrai underground variant (alt-palette · alt-substrate)

Surface Hōrai is green-and-gold. Old Hōrai is **deep amber, moss green, clay red, bioluminescent blue-green** (lore §3). The dashboard's *night state* — operator after hours, score-dashboard at 2am, the demo's "the world doesn't pause" tail — runs on this variant.

**Inversion rules** (apply to any element track):

- transpose down a perfect 4th
- swap felt piano → upright bass + bowed double bass harmonics
- swap koto → biwa (lower, more wooden)
- add **bioluminescent shimmer**: granular synthesis of a sustained vocal "ah" pitched up an octave, panned wide, low gain (-24 dB), random delay 80–250 ms
- swap brushed snare → felt-mallet on suspended cymbal (rolled, no attack)
- room: replace "Sora Tower observatory" reverb (large, bright) with "deep-honey shrine cave" (small, wet, low-pass at 6 kHz)

References for the Old Hōrai variant: **Susumu Yokota (*Grinning Cat*)**, **Hiroshi Yoshimura (*Green*)**, **Akira Kosemura (*Polaroid Piano*)**.

This is also where Ruan (the music-producer Caretaker, water/wisdom — lore §5) lives. If we ever ship a *character soundtrack* for Ruan specifically, it lives in this variant.

---

## 5 · surface map (which sound plays where)

| surface | what it is | duration | locked refs | gain target |
|---|---|---|---|---|
| **dashboard ambient bed** | always-on substrate while dashboard is open. zero melody. the room tone of Tsuheji. | 6–8 min loop, seamless | Hiroshi Yoshimura *Music for Nine Postcards* + Boards of Canada (warm cuts only) | -22 LUFS, ducks to -32 on cue |
| **cosmic weather chime** | daily oracle. ~6 s motif, plays once when a new weather drops. variation of Musubi origin (§1). | 6–8 s | Hisaishi "One Summer's Day" (4-note opening) | -14 LUFS peak, hand-played feel |
| **quiz answer ack** | "answer registered" confirmation when user taps a button | 200–300 ms | (none — it is a single felt-mallet on glass, not a synth ping) | -18 LUFS, soft attack |
| **archetype reveal cue** | the Q5 → result transition. the moment the world says *"this is who you are today"* | ~10–12 s, crescendo via instrumentation NOT volume | Hisaishi "Path of the Wind" reveal moment + Hinata "Reflections" first phrase | -18 → -12 LUFS, gentle rise |
| **stone mint cue** | the Phantom-signs moment. wallet confirms, stone arrives in collectibles | ~3 s | (NOT a "ka-ching" — single struck mokugyo + glass armonica resolve, like a temple bell at the end of a prayer) | -16 LUFS, single hit + 2.5 s tail |
| **weather-bot post sting** | optional 1 s sting at the head of @puruhpuruweather X video posts (sprint-4 stretch) | 1 s | element-coded chime variation (§3) | -16 LUFS, mono |

**The substrate ducks, never cuts** (TANDY rule, kept). When the chime plays, the bed drops to -32 LUFS over 200 ms, holds, recovers over 1.5 s with `--ease-puru-settle`. **Silence is a gain value, not an off switch.**

---

## 6 · production rules (the load-bearing constraints)

Inherited from TANDY (`identity/TANDY.md`), kept verbatim where applicable:

1. **All fading via `GainNode.gain.linearRampToValueAtTime()`.** Never `setInterval`. Audio-thread timing only.
2. **No MP3 for loops.** OGG primary (Chrome/Firefox), FLAC fallback (Safari). MP3 codec padding creates audible loop gaps.
3. **Sub below 100 Hz is MONO.** No exceptions. Phase cancellation kills laptop speakers and headphones alike.
4. **Bitcrushing ≠ sample-rate reduction.** This system uses NEITHER as a primary effect — the habitat is warm-acoustic, not degraded-digital. We DO use **tape saturation (Type I ferric)** for warmth, applied at the bus, not per-stem.
5. **The substrate ducks, never cuts.** Per §5.
6. **Tape Type I (ferric) for body, Type II (chrome) for transients.** Never Type IV (metal) — too clinical for this habitat.
7. **No quantize-to-grid on hand-played stems.** Imperfection is the texture. If the koto is 17 ms ahead of the down-beat, that is the koto.
8. **Reverb tail < 4 s.** Tsuheji is a *room*, not a *cathedral*. Cathedrals belong in the next-life bonfire (post-hackathon, if at all).
9. **One signal-chain identity per track, not three.** "Felt piano through tape-saturation through small-room convolution" — that is one identity. Adding a second (e.g., "also through bitcrush") collapses the latent attention.
10. **Treat Suno output as quarry, not finished product.** Ship at 30–60 s windows. Stem-edit in REAPER. Master at -22 LUFS integrated.

---

## 7 · suno prompt set (production-ready — copy/paste into v4.5)

The Speakers' 10-Laws Suno methodology, applied with the honey-warm atlas. **All prompts are ≤ 1000 chars, structured per the sandwich method (genre+BPM at start, identity+anchor at end), with named-references max 2.**

### 7.1 — wood / morning-garden bed (6 s breath)

```
Style of Music:
Kankyō ongaku, 70 BPM, half-time pentatonic drift in D Yo mode,
felt piano hammer with audible mechanical action,
hammered dulcimer played softly with brush-tip mallets,
koto plucked once per bar with three-second decay,
soft brushed snare on the &-of-3 only, tape-warm low strings,
modal — neither bright-major nor sad-minor — sun-dappled and unhurried,
Joe Hisaishi meets Hiroshi Yoshimura,
sparse, painterly, every element played by hand with imperfect timing,
recorded in a small wooden room at 6am with the windows open,
cassette-flutter, audible breath, room tone preserved between phrases,
instrumental
```

### 7.2 — fire / midday-ceremony bed (4 s breath)

```
Style of Music:
Pastoral ambient, 80 BPM, light kickless step in F Mixolydian,
marimba played with felt mallets — single notes, no rolls —
brushed snare with wire brushes on a low-tuned head,
warm tape-saturated string pad in the low-mids around 220 Hz,
short hand-felt mokugyo accent once every 8 bars,
modal — bright but not bright, ceremonial without grandeur,
Susumu Yokota meets Toshifumi Hinata,
sparse, hand-played, the air around the instruments is the texture,
recorded as a tea ceremony score in a sunlit teahouse,
Type I ferric tape saturation, no compression on the master,
instrumental
```

### 7.3 — earth / golden-hour drift bed (5.5 s breath)

```
Style of Music:
Felt modern ambient, 60 BPM, kickless drift in G Hirajoshi pentatonic,
hang drum struck once per phrase with the side of the thumb,
felt piano playing two-note voicings with eight-second decays,
low warm pad held continuously, almost imperceptible movement,
wood-block accent on bar 1 of every 8-bar phrase, never on bar 2,
modal, terra-warm, the sound of clay drying in golden light,
Nils Frahm meets Stars of the Lid,
sparse, still, hovering, the kiln hum is the rhythm section,
recorded in a potter's workshop at golden hour with the door open,
audible felt-on-string mechanical noise, hand-played, no quantize,
instrumental
```

### 7.4 — metal / twilight-crystalline bed (4.5 s breath)

```
Style of Music:
Crystalline new age, 75 BPM, hand-rung pulse in Bb Mixolydian b7,
glass armonica sustained tones, three glasses at once, slow rotation,
music-box bells played mechanically with a hand-cranked cylinder,
hammered dulcimer with leather mallets — softer than felt,
soft sub-bass drone at 55 Hz, mono, the floor of the mix,
modal, twilight-bronze, the sound of polishing a vessel,
Mort Garson meets Laraaji,
sparse, crystalline without being cold, the bells breathe in 4.5-second cycles,
recorded in a foundry at dusk with the kiln-bricks still warm,
zero reverb on the bells — they ring in the room itself,
instrumental
```

### 7.5 — water / night-observatory bed (5 s breath)

```
Style of Music:
Asian folk electronic, 65 BPM, granular drift in A Iwato pentatonic,
shakuhachi played with breath audible — flutter and scrape preserved,
tape-loop string pad slowly degrading across phrases,
processed vocal "ah" pitched up an octave, panned wide, granular delay,
sub-bass drone at 41 Hz, mono, felt-not-heard,
modal, night-water-on-stone, the sound of looking at the stars from the Sky-eyes Dome,
Hatis Noit meets Kenji Kawai's Ghost in the Shell main theme chant,
sparse, drifting, the breath between notes is louder than the notes,
recorded in an observatory at 2am with the dome partially open,
audible cassette-flutter and tape-bias hiss,
instrumental
```

### 7.6 — old hōrai underground variant (night-state alt-substrate)

```
Style of Music:
Hauntological-warm pastoral ambient, 55 BPM, drift in D Hirajoshi minor,
biwa plucked once per phrase with seven-second decay,
upright bass bowed double-stops in the low-mids,
suspended cymbal rolled with felt mallet — no attack, just shimmer,
granular synthesis of a held vocal "ah" pitched up an octave, low gain,
deep-cave reverb low-passed at 6 kHz, wet-but-small,
modal, deep-amber and moss-green, the sound of bioluminescent moss in a shrine,
Susumu Yokota Grinning Cat era meets Akira Kosemura,
sparse, underground, the air is wet and the bees are sleeping,
recorded in a sunken shrine at knee-deep water level,
Type I ferric tape saturation, hand-played, no quantize,
instrumental
```

### 7.7 — archetype reveal cue (10–12 s, plays once at Q5 → result)

```
Style of Music:
Hisaishi-pastoral score moment, 70 BPM rubato (no fixed tempo),
felt piano arpeggio resolving across four bars in element-active key,
warm string pad rises from inaudible to mezzo-piano over six seconds,
single hammered-dulcimer strike on the resolution downbeat,
hand-rung bell sustained for two seconds in the tail,
modal, the moment a child discovers a hidden garden,
Joe Hisaishi Path of the Wind reveal phrasing meets Toshifumi Hinata Reflections opening,
sparse, painterly, the crescendo is in the instrumentation not the volume,
recorded as a Studio Ghibli score moment in a small ensemble room,
Type I ferric tape, no compression, the air is part of the mix,
instrumental
```

### 7.8 — cosmic weather chime (6–8 s, daily oracle, element-variant via re-prompt per element above with `[chime, single phrase, no loop]` appended)

```
Style of Music:
Pentatonic chime motif, 4 notes only across 6 seconds, no tempo,
felt-mallet on glass armonica + struck mokugyo on the resolution note,
modal — descends a perfect 5th and resolves,
the oldest recorded melody in a wooden train station at dawn,
sparse, single phrase, no loop, no repetition, naturally decaying,
Hiroshi Yoshimura meets Joe Hisaishi One Summer's Day opening,
hand-played, breath audible, the listener feels the room before the notes,
recorded in Musubi Station's central hall at 5am,
audible mechanical action, zero processing,
instrumental
```

### lyrics field (for ALL prompts above)

```
[Intro]
[Held tone]
[Phrase 1]
[Pause — room tone]
[Phrase 2]
[Long decay]
[End]
```

---

## 8 · validation checklist (run before generating)

Per the Speakers' suno-prompt skill — but with the honey-warm atlas:

- [ ] under 1000 characters
- [ ] zero tokens from the never-include list (§2)
- [ ] at least one token from the always-prefer list (§2)
- [ ] at least one named reference from the honey-warm atlas (§2)
- [ ] max 2 named references
- [ ] anti-cheese anchor present (cassette / tape-flutter / hand-played / breath-audible / room-tone)
- [ ] identity-first framing ("recorded in / as a") — Recorder not Composer
- [ ] sandwich method applied (genre + BPM at start; identity + anchor at end)
- [ ] **golden rule**: would NOT appear on a Spotify "Lo-fi Beats to Study To" playlist description (the Speakers' rule, kept)
- [ ] **purupuru rule (NEW)**: would feel correct as the soundtrack to a Studio Ghibli still frame

---

## 9 · variant strategy (when a prompt nearly works)

Per Speakers' Suno-prompt §6: shift ONE axis per variant.

- **timbral** — felt piano → prepared piano → toy piano → mbira
- **density** — three instruments → two → one solo + room tone
- **reference** — Hisaishi → Yoshimura → Yokota (always within the honey-warm atlas)
- **era** — 1981 (Yoshimura's *Music for Nine Postcards* era) → 1997 (Yokota's *Sakura* era) → 2024 (modern Frahm/Arnalds)
- **room** — wooden train station → teahouse → potter's workshop → observatory → sunken shrine

Never shift more than one axis at a time. Evaluate variants by isolation of variables.

---

## 10 · open questions (for gumi · @zksoju · sprint-4 cooking)

1. **Does Ruan author the music in-world?** If yes, the dashboard music IS Ruan's music — and the Old Hōrai variant becomes her after-hours register. Decision affects whether we credit a fictional artist on Suno outputs.
2. **Voice register on the weather-bot post sting** — does the bot also have an *audio voice*? Currently the bot is text-only. A 1-second sting could become its sonic ID. Optional sprint-4.
3. **Does the chime have a fixed canonical melody?** Lore says "the oldest recorded melody." We could either (a) keep it abstract — every dashboard surface gets a re-voiced variant — or (b) commit to a specific 4-note sequence as canon. Recommendation: (a) for now, (b) only if/when gumi wants to lock it.
4. **Stone mint cue — temple bell or hammered dulcimer?** Both fit the habitat. Temple bell (mokugyo) is more *ceremonial*; dulcimer is more *gentle*. Operator preference needed before sprint-4 recording.

---

## 11 · what this foundation enables

- **Sprint-4 demo recording** has a locked sonic palette. We can generate the dashboard bed + reveal cue + mint cue this week, stem-edit in REAPER, and have demo audio ready before the 2026-05-11 deadline.
- **Score dashboard (zerker's lane)** can adopt the dashboard ambient bed as ambient continuity for community-manager view. Same atlas, same rules, same breathing.
- **Weather-bot stings** gain a sonic identity (sprint-4 stretch). The X video posts can carry a 1-second element-keyed chime that *also* sounds like Tsuheji.
- **Future puruhani character soundtracks** (post-hackathon) inherit this atlas. Each Caretaker / Puruhani pair gets a register inside the existing element palette — e.g., Ruan = water-element + Old Hōrai variant, Akane = fire-element + late-night-rooftop sub-variant.

---

## sources

- **lore-bible**: `~/bonfire/purupuru/grimoires/purupuru/lore-bible.md` — §1 Tsuheji aesthetic · §2 Hōrai (Musubi chime, Sora Tower) · §3 Old Hōrai underground · §4 Puruhani · §5 KIZUNA Caretakers (Ruan = music producer / water / wisdom) · §8 HENLO color/element/virtue mapping
- **PRD**: `~/bonfire/grimoires/bonfire/specs/purupuru-ttrpg-genesis-prd-2026-05-07.md` — §3 three-view architecture · §3.2 separation-as-moat · FR-12 zerker dashboard lane · §7.5 sprint-4 demo simulator (where this audio plays)
- **design tokens**: `purupuru-ttrpg/app/globals.css` — `--breath-{element}` durations · 8 `--ease-puru-*` curves · 5 OKLCH element palettes
- **construct method (kept)**: `.claude/constructs/packs/the-speakers/identity/TANDY.md` — 5-layer vertical foundation · sub-mono · ducking · GainNode rules
- **construct method (kept)**: `.claude/constructs/packs/the-speakers/skills/suno-prompt/SKILL.md` — 10 Laws · sandwich method · validation checklist · variant strategy
- **construct method (kept)**: `.claude/constructs/packs/artisan/identity/ALEXANDER.md` — voice as named principles, sensory vocabulary as technical specification

---

*This is a foundation document. It will be amended as Suno generations validate or invalidate specific prompts. Treat the atlas as canonical; treat the prompts as v0 — quarry, not product.*
