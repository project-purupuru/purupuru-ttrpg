import type { Metadata } from "next";
import { BattleScene } from "./_scene/BattleScene";

export const metadata: Metadata = {
  title: "Battle · Purupuru",
  description: "Arrange your lineup. Discover the chain. Lock in.",
};

export default function BattlePage() {
  return <BattleScene />;
}
