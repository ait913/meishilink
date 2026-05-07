import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PublicCard } from "@/app/[handle]/PublicCard";
import { selectThemeAction } from "@/app/(owner)/dashboard/actions";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { THEMES } from "@/lib/theme";

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

export default async function TemplatesPage() {
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

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">テンプレート</p>
          <h1 className="text-3xl font-semibold">見た目を選ぶ</h1>
        </div>
        <a className="rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-white/70" href="/dashboard">
          ダッシュボードへ戻る
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Object.values(THEMES).map((theme) => (
          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-neutral-200/60" key={theme.key}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{theme.label}</h2>
                <p className="text-sm text-neutral-500">{theme.key}</p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await selectThemeAction(theme.key);
                }}
              >
                <Button type="submit" variant={card.themeKey === theme.key ? "primary" : "secondary"}>
                  {card.themeKey === theme.key ? "選択中" : "このテーマにする"}
                </Button>
              </form>
            </div>
            <PublicCard
              card={{
                ...card,
                themeKey: theme.key,
                snsLinks: parseSnsLinks(card.snsLinks),
              }}
              compact
            />
          </section>
        ))}
      </div>
    </main>
  );
}
