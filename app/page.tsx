import { ObservatoryClient } from "@/components/observatory/ObservatoryClient";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("home");

export default function ObservatoryPage() {
  return <ObservatoryClient />;
}
