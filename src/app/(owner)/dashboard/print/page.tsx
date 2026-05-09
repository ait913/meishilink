import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PrintClient } from "@/app/(owner)/dashboard/print/PrintClient";
import { prisma } from "@/lib/prisma";

function parseSnsLinks(value: string | null) {
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function PrintPage() {  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const card = await prisma.card.findUnique({
    where: { userId: session.user.id },
  });
  if (!card) {
    redirect("/onboarding");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">印刷プレビュー</p>
          <h1 className="text-3xl font-semibold">単票と A4 量産</h1>
        </div>
        <a className="rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-white/70" href="/dashboard">
          ダッシュボードへ戻る
        </a>
      </div>
      <PrintClient
        card={{
          ...card,
          logoPath: card.logoPath,
          snsLinks: parseSnsLinks(card.snsLinks),
        }}
      />
    </main>
  );
}

