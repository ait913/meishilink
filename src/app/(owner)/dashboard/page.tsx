import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { DashboardEditor } from "@/app/(owner)/dashboard/DashboardEditor";
import { generateQrPngDataUrl, generateQrSvgString } from "@/lib/qr";
import { prisma } from "@/lib/prisma";
import { getStatsForCard } from "@/lib/stats";

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

export default async function DashboardPage() {
  const cookieStore = await cookies();
  void cookieStore;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const card = await prisma.card.findUnique({
    where: { userId: session.user.id },
  });
  if (!card) {
    redirect("/onboarding");
  }

  const publicUrl = `${process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"}/${card.handle}`;
  const [qrPngDataUrl, qrSvgString, stats] = await Promise.all([
    generateQrPngDataUrl(publicUrl),
    generateQrSvgString(publicUrl),
    getStatsForCard(card.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-end">
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-white/70" type="submit">
            ログアウト
          </button>
        </form>
      </div>
      <DashboardEditor
        card={{
          ...card,
          logoPath: card.logoPath,
          snsLinks: parseSnsLinks(card.snsLinks),
        }}
        publicUrl={publicUrl}
        qrPngDataUrl={qrPngDataUrl}
        qrSvgString={qrSvgString}
        stats={stats}
      />
    </main>
  );
}

