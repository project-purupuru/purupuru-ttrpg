import { ObservatoryClient } from "@/components/observatory/ObservatoryClient";

export const metadata = {
  title: "purupuru — observatory",
  description:
    "The live observatory of every puruhani in the world, breathing and reacting to weather and on-chain action.",
};

export default function ObservatoryPage() {
  return <ObservatoryClient />;
}
