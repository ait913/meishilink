"use client";

import { useEffect, useState } from "react";

import { MoreModal } from "@/app/[handle]/MoreModal";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/dexie";
import { SavedContactSchema } from "@/lib/zod-schemas";

type Props = {
  handle: string;
  fullName: string;
  company?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  themeKey: string;
  accentColor: string;
  sourceUrl: string;
  poem?: string | null;
  profile?: string | null;
  snsLinks: Array<{ label: string; url: string }>;
};

export function ViewerActions(props: Props) {
  const [savedState, setSavedState] = useState<"none" | "saved" | "error">("none");
  const [open, setOpen] = useState(false);
  const hasMore = Boolean(props.poem || props.profile || props.snsLinks.length > 0);

  useEffect(() => {
    void fetch("/api/log/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: props.handle }),
    }).catch(() => undefined);
  }, [props.handle]);

  async function saveLocal() {
    try {
      const existing = await db.contacts.where("handle").equals(props.handle).first();
      const contact = SavedContactSchema.parse({
        id: existing?.id ?? crypto.randomUUID(),
        handle: props.handle,
        fullName: props.fullName,
        company: props.company ?? undefined,
        jobTitle: props.jobTitle ?? undefined,
        phone: props.phone ?? undefined,
        email: props.email ?? undefined,
        websiteUrl: props.websiteUrl ?? undefined,
        logoUrl: props.logoUrl ?? undefined,
        themeKey: props.themeKey,
        accentColor: props.accentColor,
        savedAt: Date.now(),
        sourceUrl: props.sourceUrl,
      });
      await db.contacts.put(contact);
      setSavedState("saved");
    } catch {
      setSavedState("error");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <a className="inline-flex min-h-11 items-center rounded-2xl bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800" download href={`/${props.handle}/vcard`}>
          連絡先に保存 (vCard)
        </a>
        <Button onClick={() => void saveLocal()} variant="secondary">
          ローカルに保存
        </Button>
        {hasMore ? (
          <Button onClick={() => setOpen(true)} variant="ghost">
            もっと見る
          </Button>
        ) : null}
      </div>
      {savedState === "saved" ? <p className="text-sm text-emerald-600">ローカルに保存しました。</p> : null}
      {savedState === "error" ? <p className="text-sm text-red-600">保存に失敗しました。</p> : null}
      <MoreModal onClose={() => setOpen(false)} open={open} poem={props.poem} profile={props.profile} snsLinks={props.snsLinks} />
    </div>
  );
}

