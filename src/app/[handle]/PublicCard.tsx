import { CardPreview } from "@/components/card/CardPreview";
import type { PublicCardViewModel } from "@/components/card/types";

export function PublicCard({ card, compact = false }: { card: PublicCardViewModel; compact?: boolean }) {
  return <CardPreview card={card} compact={compact} />;
}

