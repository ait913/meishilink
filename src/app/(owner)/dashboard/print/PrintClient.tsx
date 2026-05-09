"use client";

import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

import { CardPreview } from "@/components/card/CardPreview";
import type { PublicCardViewModel } from "@/components/card/types";
import { Button } from "@/components/ui/Button";

export function PrintClient({ card }: { card: PublicCardViewModel }) {
  const [mode, setMode] = useState<"single" | "a4grid">("single");
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `${card.handle}-print`,
  });

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-neutral-200/60">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setMode("single")} variant={mode === "single" ? "primary" : "secondary"}>
            単票 91x55mm
          </Button>
          <Button onClick={() => setMode("a4grid")} variant={mode === "a4grid" ? "primary" : "secondary"}>
            A4 量産 (2x5)
          </Button>
          <Button onClick={() => void handlePrint()}>印刷する</Button>
        </div>
      </div>

      <style>{mode === "single" ? "@media print { @page { size: 91mm 55mm; margin: 0; } }" : "@media print { @page { size: A4; margin: 0; } }"}</style>

      <div className="overflow-auto rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-neutral-200/60">
        <div ref={contentRef}>
          {mode === "single" ? (
            <div className="print-single">
              <CardPreview card={card} compact />
            </div>
          ) : (
            <div className="print-a4-grid">
              {Array.from({ length: 9 }).map((_, index) => (
                <CardPreview card={card} compact key={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

