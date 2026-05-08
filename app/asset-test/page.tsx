import s from "./asset-test.module.css";
import { HoneyParticles } from "./HoneyParticles";
import { PuruWordmark } from "@/components/world-purupuru/PuruWordmark";
import { METAL_CANDIDATES } from "@/components/world-purupuru/MetalIconCandidates";
import {
  BRAND,
  CELESTIAL,
  ELEMENT_IDS,
  KANJI,
  CARETAKER_NAMES,
  ELEMENT_ICONS_THUMB,
  BEAR_FACES,
  JANI_GUARDIAN_THUMB,
  JANI_ELEMENTAL,
  CARETAKER_CHIBI,
  CARETAKER_ART_THUMB,
  CARETAKER_FULL,
  CARETAKER_SCENES_HD,
  WORLD_SCENES,
  GROUP_ART,
  WORLD_MAP,
  BOARDING_PASSES,
  CARD_PASTEL,
  CARD_SATURATED,
  JANI_CARDS,
  PURUHANI_ART_THUMB,
  TEXTURES,
  type ElementId,
} from "@/lib/world-purupuru-cdn";

export const metadata = {
  title: "asset-test · pulled from world-purupuru",
};

const breatheClass: Record<ElementId, string> = {
  wood: s.breatheWood,
  fire: s.breatheFire,
  earth: s.breatheEarth,
  metal: s.breatheMetal,
  water: s.breatheWater,
};

function ElementsRow({
  src,
  shape = "square",
  animate,
}: {
  src: Record<ElementId, string>;
  shape?: "square" | "circle";
  animate?: "breathe" | "chibi" | "float";
}) {
  return (
    <div className={`${s.grid} ${s.gridSm}`}>
      {ELEMENT_IDS.map((id) => {
        const animClass =
          animate === "breathe"
            ? breatheClass[id]
            : animate === "chibi"
            ? s.chibiBreathe
            : animate === "float"
            ? s.puruhaniFloat
            : "";
        return (
          <div key={id} className={s.tile}>
            <div className={shape === "circle" ? s.circular : s.tileSquare}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src[id]} alt={`${id} ${KANJI[id]}`} className={animClass} />
            </div>
            <span className={s.tileLabel}>
              {KANJI[id]} {id}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AssetTestPage() {
  return (
    <div className={s.page}>
      <p className={s.subtitle}>asset-test · world-purupuru</p>
      <h1 className={s.title}>visual library — pick what to use</h1>
      <p className={s.sectionNote}>
        Hotlinked from the public S3 + Vercel thumb CDN — no local copies. Pick
        what you want, then we&apos;ll wire those specific items into the
        observatory route.
      </p>

      {/* ── Hero — celestial breathe ────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>01 · celestial</p>
        <h2 className={s.sectionTitle}>sun & moon — breath rhythm</h2>
        <p className={s.sectionNote}>
          Idle ambient: 6s scale + translateY breathe via{" "}
          <code>--ease-puru-breathe</code>. Glow is a blurred radial-gradient
          sibling.
        </p>
        <div className={s.hero}>
          <div className={s.celestialGlow} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={s.celestial} src={CELESTIAL.sun} alt="sun" />
        </div>
        <div className={s.row}>
          <div className={s.tile} style={{ width: 140 }}>
            <div className={s.tileSquare}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CELESTIAL.sun} alt="sun" className={s.chibiBreathe} />
            </div>
            <span className={s.tileLabel}>sun-icon</span>
          </div>
          <div className={s.tile} style={{ width: 140 }}>
            <div className={s.tileSquare}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CELESTIAL.moon} alt="moon" className={s.chibiBreathe} />
            </div>
            <span className={s.tileLabel}>moon-and-clouds</span>
          </div>
        </div>
      </section>

      {/* ── Animated wordmark ───────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>02a · animated wordmark</p>
        <h2 className={s.sectionTitle}>zubora bouncing — for the navbar</h2>
        <p className={s.sectionNote}>
          Each letter wobbles on its own golden-ratio-detuned phase. The
          underlying SVG is also displaced through an animated{" "}
          <code>feTurbulence</code> filter — the gentle organic distortion
          you see is the noise field morphing in real time. Three variants:
          ink (mono / currentColor), honey (warm gold gradient), cloud
          (parchment mist).
        </p>
        <div className={`${s.row} ${s.wordmarkRow}`}>
          <div className={s.tile} style={{ minWidth: 280 }}>
            <div
              style={{
                padding: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--puru-ink-base)",
                background: "var(--puru-cloud-base)",
                borderRadius: 12,
              }}
            >
              <PuruWordmark variant="ink" width={220} />
            </div>
            <span className={s.tileLabel}>ink — currentColor</span>
          </div>
          <div className={s.tile} style={{ minWidth: 280 }}>
            <div
              style={{
                padding: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--puru-cloud-base)",
                borderRadius: 12,
              }}
            >
              <PuruWordmark variant="honey" width={220} />
            </div>
            <span className={s.tileLabel}>honey — warm gold</span>
          </div>
          <div className={s.tile} style={{ minWidth: 280 }}>
            <div
              style={{
                padding: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "oklch(0.18 0.012 80)",
                borderRadius: 12,
              }}
            >
              <PuruWordmark variant="cloud" width={220} />
            </div>
            <span className={s.tileLabel}>cloud — parchment, dark bg</span>
          </div>
        </div>
        <div className={s.row} style={{ marginTop: 16 }}>
          <div className={s.tile} style={{ minWidth: 200 }}>
            <div
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                background: "var(--puru-cloud-bright)",
                borderRadius: 8,
              }}
            >
              <PuruWordmark variant="honey" width={120} />
            </div>
            <span className={s.tileLabel}>navbar size · 120px</span>
          </div>
          <div className={s.tile} style={{ minWidth: 160 }}>
            <div
              style={{
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                background: "var(--puru-cloud-bright)",
                borderRadius: 8,
                color: "var(--puru-ink-base)",
              }}
            >
              <PuruWordmark variant="ink" width={88} />
            </div>
            <span className={s.tileLabel}>compact · 88px ink</span>
          </div>
        </div>
      </section>

      {/* ── Brand ───────────────────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>02 · brand</p>
        <h2 className={s.sectionTitle}>logo & wordmark</h2>
        <div className={s.row}>
          <div className={s.tile} style={{ width: 200 }}>
            <div className={s.tileSquare}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BRAND.logo} alt="logo" />
            </div>
            <span className={s.tileLabel}>project-purupuru-logo</span>
          </div>
          <div
            className={s.tile}
            style={{ width: 240, background: "var(--puru-cloud-dim)" }}
          >
            <div style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BRAND.wordmark} alt="wordmark" style={{ height: 48 }} />
            </div>
            <span className={s.tileLabel}>purupuru-wordmark.svg</span>
          </div>
          <div className={s.tile} style={{ width: 160 }}>
            <div className={s.tilePortrait}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BRAND.logoCardBack} alt="card back" />
            </div>
            <span className={s.tileLabel}>card-back</span>
          </div>
        </div>
      </section>

      {/* ── Element icons ───────────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>03 · element icons</p>
        <h2 className={s.sectionTitle}>wuxing — sprout, flame, sun, jani-metal, drop</h2>
        <p className={s.sectionNote}>
          Per-element <code>--breath-*</code> rhythms applied (4–6s, asymmetric).
        </p>
        <ElementsRow src={ELEMENT_ICONS_THUMB} animate="breathe" />
      </section>

      {/* ── Metal candidates ────────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>03b · metal · candidates</p>
        <h2 className={s.sectionTitle}>
          replacement for jani-metal-element-face
        </h2>
        <p className={s.sectionNote}>
          The world-purupuru bucket only ships the jani face for metal — it&apos;s
          the only of the five that lacks a clean symbolic icon. Six SVG
          alternates below, all in <code>--puru-metal-vivid</code>. Pick one
          and I&apos;ll wire it into the pentagram.
        </p>
        <div className={s.row} style={{ alignItems: "stretch", marginBottom: 12 }}>
          <div className={s.tile} style={{ width: 140 }}>
            <div
              className={s.tileSquare}
              style={{ background: "var(--puru-metal-tint)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://thj-assets.s3.us-west-2.amazonaws.com/Purupuru/icons/jani-metal-element-face.png"
                alt="current metal (jani face)"
                className={s.breatheMetal}
              />
            </div>
            <span className={s.tileLabel}>CURRENT · jani-face</span>
          </div>
          <div
            style={{
              borderLeft: "1px dashed var(--puru-cloud-dim)",
              margin: "0 8px",
            }}
          />
          {METAL_CANDIDATES.map(({ id, label, Component }) => (
            <div key={id} className={s.tile} style={{ width: 140 }}>
              <div
                className={s.tileSquare}
                style={{ background: "var(--puru-metal-tint)" }}
              >
                <Component className={s.breatheMetal} />
              </div>
              <span className={s.tileLabel}>{label}</span>
            </div>
          ))}
        </div>
        <p className={s.sectionNote}>
          Side-by-side with the other four element icons:
        </p>
        <div className={s.row} style={{ alignItems: "flex-end" }}>
          {(["wood", "fire", "earth"] as const).map((id) => (
            <div key={id} className={s.tile} style={{ width: 120 }}>
              <div className={s.tileSquare}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ELEMENT_ICONS_THUMB[id]}
                  alt={id}
                  className={breatheClass[id]}
                />
              </div>
              <span className={s.tileLabel}>
                {KANJI[id]} {id}
              </span>
            </div>
          ))}
          {METAL_CANDIDATES.slice(0, 4).map(({ id, label, Component }) => (
            <div key={`metal-${id}`} className={s.tile} style={{ width: 120 }}>
              <div className={s.tileSquare}>
                <Component className={s.breatheMetal} />
              </div>
              <span className={s.tileLabel}>金 {label.split(" ")[0]}</span>
            </div>
          ))}
          <div className={s.tile} style={{ width: 120 }}>
            <div className={s.tileSquare}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ELEMENT_ICONS_THUMB.water}
                alt="water"
                className={s.breatheWater}
              />
            </div>
            <span className={s.tileLabel}>水 water</span>
          </div>
        </div>
      </section>

      {/* ── Bear faces ──────────────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>04 · bear faces</p>
        <h2 className={s.sectionTitle}>panda · black · brown · polar · red-panda</h2>
        <ElementsRow src={BEAR_FACES} shape="circle" animate="chibi" />
      </section>

      {/* ── Jani guardians ──────────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>05 · jani guardians</p>
        <h2 className={s.sectionTitle}>face thumbs (transparent)</h2>
        <ElementsRow src={JANI_GUARDIAN_THUMB} animate="chibi" />
      </section>

      {/* ── Jani elemental portraits ────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>06 · jani elemental</p>
        <h2 className={s.sectionTitle}>square portraits — honeycomb backdrop</h2>
        <div className={`${s.grid} ${s.gridMd}`}>
          {ELEMENT_IDS.map((id) => (
            <div key={id} className={s.tile}>
              <div className={s.tileSquare} style={{ aspectRatio: 1 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={JANI_ELEMENTAL[id]}
                  alt={`jani ${id}`}
                  className={breatheClass[id]}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <span className={s.tileLabel}>
                {KANJI[id]} jani-{id}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Caretaker chibi PFPs ────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>07 · caretaker chibi pfps</p>
        <h2 className={s.sectionTitle}>circular pastel — for badges/avatars</h2>
        <div className={`${s.grid} ${s.gridMd}`}>
          {ELEMENT_IDS.map((id) => (
            <div key={id} className={s.tile}>
              <div className={s.circular}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CARETAKER_CHIBI[id]} alt={CARETAKER_NAMES[id]} />
              </div>
              <span className={s.tileLabel}>
                {CARETAKER_NAMES[id]} · {id}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Caretaker art thumbs ────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>08 · caretaker art (chibi)</p>
        <h2 className={s.sectionTitle}>transparent chibis — compositing-ready</h2>
        <p className={s.sectionNote}>
          Same zubora 3-stop breathe used by ChibiAgent in the source repo.
        </p>
        <div className={`${s.grid} ${s.gridMd}`}>
          {ELEMENT_IDS.map((id) => (
            <div key={id} className={s.tile}>
              <div
                className={s.tileSquare}
                style={{ background: `var(--puru-${id}-tint)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={CARETAKER_ART_THUMB[id]}
                  alt={CARETAKER_NAMES[id]}
                  className={s.chibiBreathe}
                />
              </div>
              <span className={s.tileLabel}>{CARETAKER_NAMES[id]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Caretaker full body ─────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>09 · caretaker full body</p>
        <h2 className={s.sectionTitle}>transparent anime — battle / results stage</h2>
        <div className={`${s.grid} ${s.gridLg}`}>
          {ELEMENT_IDS.map((id) => (
            <div key={id} className={s.tile}>
              <div
                className={s.tilePortrait}
                style={{ background: `var(--puru-${id}-tint)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CARETAKER_FULL[id]} alt={CARETAKER_NAMES[id]} />
              </div>
              <span className={s.tileLabel}>{CARETAKER_NAMES[id]} fullbody</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Caretaker scenes HD ─────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>10 · caretaker scenes</p>
        <h2 className={s.sectionTitle}>caretaker × puruhani vignettes</h2>
        <div className={`${s.grid} ${s.gridScene}`}>
          {ELEMENT_IDS.map((id) => (
            <div key={id} className={s.tile}>
              <div className={s.tileScene}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CARETAKER_SCENES_HD[id]} alt={`${id} scene`} />
              </div>
              <span className={s.tileLabel}>
                {CARETAKER_NAMES[id]} · {id}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── World scenes ────────────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>11 · world scenes</p>
        <h2 className={s.sectionTitle}>tsuheji bus stops — time of day per element</h2>
        <div className={`${s.grid} ${s.gridScene}`}>
          {ELEMENT_IDS.map((id) => (
            <div key={id} className={s.tile}>
              <div className={s.tileScene}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={WORLD_SCENES[id]} alt={`bus stop ${id}`} />
              </div>
              <span className={s.tileLabel}>
                {KANJI[id]} {id} bus stop
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Group art ───────────────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>12 · group art</p>
        <h2 className={s.sectionTitle}>ensemble worldbuilding scenes</h2>
        <div className={`${s.grid} ${s.gridScene}`}>
          {Object.entries(GROUP_ART).map(([key, src]) => (
            <div key={key} className={s.tile}>
              <div className={s.tileScene}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={key} />
              </div>
              <span className={s.tileLabel}>{key}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── World map ───────────────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>13 · world map</p>
        <h2 className={s.sectionTitle}>tsuheji continent</h2>
        <div className={s.tile} style={{ maxWidth: 720 }}>
          <div style={{ borderRadius: 12, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={WORLD_MAP} alt="tsuheji world map" style={{ width: "100%", display: "block" }} />
          </div>
          <span className={s.tileLabel}>tsuheji-world-map.png</span>
        </div>
      </section>

      {/* ── Boarding passes ─────────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>14 · boarding passes</p>
        <h2 className={s.sectionTitle}>stamp tickets — hover to straighten</h2>
        <div className={`${s.grid} ${s.gridMd}`}>
          {(Object.entries(BOARDING_PASSES) as [ElementId, string][]).map(
            ([id, src]) =>
              src && (
                <div key={id} className={`${s.tile} ${s.passTilt}`}>
                  <div className={s.tilePortrait}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`pass ${id}`} />
                  </div>
                  <span className={s.tileLabel}>boarding-pass {id}</span>
                </div>
              ),
          )}
        </div>
      </section>

      {/* ── Cards — pastel ──────────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>15 · cards · pastel</p>
        <h2 className={s.sectionTitle}>caretaker cards — pastel frame</h2>
        <div className={`${s.grid} ${s.gridLg}`}>
          {ELEMENT_IDS.map((id) => (
            <div key={id} className={`${s.tile} ${s.shimmer}`}>
              <div className={s.tilePortrait}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CARD_PASTEL[id]} alt={`${id} card pastel`} />
              </div>
              <span className={s.tileLabel}>
                {CARETAKER_NAMES[id]} · pastel
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cards — saturated ───────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>16 · cards · saturated</p>
        <h2 className={s.sectionTitle}>caretaker cards — saturated frame</h2>
        <div className={`${s.grid} ${s.gridLg}`}>
          {ELEMENT_IDS.map((id) => (
            <div key={id} className={s.tile}>
              <div className={s.tilePortrait}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CARD_SATURATED[id]} alt={`${id} card saturated`} />
              </div>
              <span className={s.tileLabel}>
                {CARETAKER_NAMES[id]} · saturated
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Jani trading cards ──────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>17 · jani trading cards</p>
        <h2 className={s.sectionTitle}>pre-composed pokemon-style</h2>
        <div className={`${s.grid} ${s.gridLg}`}>
          {(Object.entries(JANI_CARDS) as [ElementId, string][]).map(
            ([id, src]) =>
              src && (
                <div key={id} className={s.tile}>
                  <div className={s.tilePortrait}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`jani card ${id}`} />
                  </div>
                  <span className={s.tileLabel}>
                    {KANJI[id]} jani-trading-{id}
                  </span>
                </div>
              ),
          )}
        </div>
      </section>

      {/* ── Puruhani — float animation ──────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>18 · puruhani</p>
        <h2 className={s.sectionTitle}>creatures — gentle float</h2>
        <p className={s.sectionNote}>
          Vertical drift with subtle rotation. Suitable for floating mascots
          on the dashboard rail.
        </p>
        <div className={`${s.grid} ${s.gridSm}`}>
          {ELEMENT_IDS.map((id) => (
            <div key={id} className={s.tile}>
              <div
                className={s.tileSquare}
                style={{ background: `var(--puru-${id}-tint)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PURUHANI_ART_THUMB[id]}
                  alt={`puruhani ${id}`}
                  className={s.puruhaniFloat}
                  style={{ animationDelay: `${ELEMENT_IDS.indexOf(id) * 0.6}s` }}
                />
              </div>
              <span className={s.tileLabel}>
                {KANJI[id]} puruhani
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Honey particles ─────────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>19 · honey particles</p>
        <h2 className={s.sectionTitle}>canvas — 24 motes, detuned curl</h2>
        <p className={s.sectionNote}>
          The “material of thought” — three detuned sinusoids per particle so
          no two move in lockstep. Ports cleanly into the observatory rail.
        </p>
        <div className={s.particlesWrap}>
          <HoneyParticles />
        </div>
      </section>

      {/* ── Textures ────────────────────────────────────────────── */}
      <section className={s.section}>
        <p className={s.sectionLabel}>20 · textures</p>
        <h2 className={s.sectionTitle}>card overlays — grain · cosmos · foil</h2>
        <p className={s.sectionNote}>
          Use as <code>background-image</code> with <code>mix-blend-mode: screen</code> or{" "}
          <code>overlay</code> on top of cards/scenes.
        </p>
        <div className={`${s.grid} ${s.gridMd}`}>
          {Object.entries(TEXTURES).map(([key, src]) => (
            <div key={key} className={s.tile}>
              <div
                className={s.texture}
                style={{ backgroundImage: `url(${src})` }}
              />
              <span className={s.tileLabel}>{key}</span>
            </div>
          ))}
        </div>
      </section>

      <p className={s.sectionNote} style={{ marginTop: 64 }}>
        ── end of inventory ──
      </p>
    </div>
  );
}
