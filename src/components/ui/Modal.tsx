"use client";

import type { PropsWithChildren } from "react";

import { Button } from "@/components/ui/Button";

export function Modal({
  children,
  open,
  onClose,
  title,
}: PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title: string;
}>) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-neutral-950">{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            閉じる
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

