import type { Metadata } from "next";

import { SavedClient } from "@/app/(viewer)/saved/SavedClient";

export const metadata: Metadata = {
  title: "保存した名刺",
  description: "閲覧した Web 名刺をスマホ内に保存し、検索・並べ替えで管理できます。",
  robots: { index: false, follow: false },
};

export default async function SavedPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <SavedClient />
    </main>
  );
}
