"use client";

/**
 * ElementQuiz — 1:1 port of world-purupuru ElementQuiz.svelte.
 * One screen: pick your element. CSS lives in app/battle/_styles/ElementQuiz.css.
 */

import { useEffect, useState } from "react";
import { ELEMENT_META, type Element } from "@/lib/honeycomb/wuxing";
import { matchCommand } from "@/lib/runtime/match.client";
import { updateMatchStorage } from "@/lib/honeycomb/storage";

interface SceneSpec {
  readonly element: Element;
  readonly scene: string;
  readonly puruhani: string;
  readonly sceneArt: string;
  readonly caretakerArt: string;
}

// Scenes are LOCATIONS, not character closeups. Element-tinted gradients
// + atmospheric overlays carry the place. Caretaker mural lives outside
// the scene card. Local-only assets; no CDN dependency.
const SCENES: readonly SceneSpec[] = [
  {
    element: "wood",
    scene: "A garden at dawn",
    sceneArt: "/art/scenes/kaori-sakura.png",
    caretakerArt: "/thumbs/caretakers/caretaker-kaori-pose.webp",
    puruhani: "/thumbs/puruhani/hopeful-puruhani.png",
  },
  {
    element: "fire",
    scene: "The station at noon",
    sceneArt: "/art/scenes/akane-station.png",
    caretakerArt: "/thumbs/caretakers/caretaker-akane-puruhani-chibi.webp",
    puruhani: "/thumbs/puruhani/nefarious-puruhani.png",
  },
  {
    element: "earth",
    scene: "A kitchen in amber light",
    // No local location asset for earth yet — gradient-only via .scene-tint.
    sceneArt: "",
    caretakerArt: "/thumbs/caretakers/caretaker-nemu-earth.webp",
    puruhani: "/thumbs/puruhani/exhausted-puruhani.png",
  },
  {
    element: "metal",
    scene: "An observatory at dusk",
    sceneArt: "",
    caretakerArt: "/thumbs/caretakers/caretaker-ren-with-puruhani.webp",
    puruhani: "/thumbs/puruhani/loving-puruhani.png",
  },
  {
    element: "water",
    scene: "A tide pool at night",
    sceneArt: "",
    caretakerArt: "/thumbs/caretakers/caretaker-ruan-cute-pose.webp",
    puruhani: "/thumbs/puruhani/overwhelmed-puruhani.png",
  },
];

export function ElementQuiz() {
  const [selected, setSelected] = useState<Element | null>(null);

  useEffect(() => {
    if (!selected) return;
    updateMatchStorage("playerElement", selected);
    const t = setTimeout(() => matchCommand.chooseElement(selected), 600);
    return () => clearTimeout(t);
  }, [selected]);

  return (
    <div
      className={`quiz${selected !== null ? " quiz-tinted" : ""}`}
      data-element={selected ?? undefined}
    >
      <h2 className="quiz-title">choose your element.</h2>

      <div className="scene-grid">
        {SCENES.map((s, i) => {
          const meta = ELEMENT_META[s.element];
          const isChosen = selected === s.element;
          const isFaded = selected !== null && selected !== s.element;
          return (
            <div
              key={s.element}
              className={[
                "scene-wrap",
                isChosen && "chosen",
                isFaded && "faded",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <button
                type="button"
                className={`scene-card${s.sceneArt ? "" : " scene-card-gradient"}`}
                data-element={s.element}
                onClick={() => setSelected(s.element)}
                disabled={selected !== null}
                aria-label={`${meta.name} · ${s.scene}`}
              >
                {s.sceneArt && (
                  <img
                    className="scene-art"
                    src={s.sceneArt}
                    alt={s.scene}
                    loading="lazy"
                  />
                )}
                <div className="scene-tint" data-element={s.element} />
                <span className="scene-kanji">{meta.kanji}</span>
                <span className="scene-place">{s.scene}</span>
              </button>

              <img
                className="mural-caretaker"
                src={s.caretakerArt}
                alt={meta.caretaker}
                loading="lazy"
              />
              <img
                className="mural-puruhani"
                src={s.puruhani}
                alt={`${meta.caretaker}'s puruhani`}
                loading="lazy"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
