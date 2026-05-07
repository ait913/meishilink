import Link from "next/link";
import { cookies } from "next/headers";

import { MeishiLogo } from "@/components/icons/MeishiLogo";
import { auth } from "@/auth";

export default async function Page() {
  const cookieStore = await cookies();
  void cookieStore;
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <header className="mb-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MeishiLogo />
          <div>
            <p className="text-sm text-neutral-500">Web business card</p>
            <h1 className="text-xl font-semibold">MeishiLink</h1>
          </div>
        </div>
        <Link className="rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-white/70" href={session?.user ? "/dashboard" : "/login"}>
          {session?.user ? "ダッシュボード" : "ログイン"}
        </Link>
      </header>

      <section className="grid flex-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-neutral-300 bg-white/70 px-4 py-1 text-sm text-neutral-600">
              QR で共有、vCard で保存、閲覧者登録不要
            </p>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-5xl font-semibold tracking-tight text-neutral-950 md:text-6xl">
                紙名刺をデジタルに。
                <span className="block text-neutral-500">あなたの URL で名刺を渡そう。</span>
              </h2>
              <p className="max-w-2xl text-lg text-neutral-600">
                MeishiLink は、あなた専用の公開 URL、QR、vCard、ローカル保存を一つの導線にまとめた Web 名刺です。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link className="rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800" href={session?.user ? "/dashboard" : "/login"}>
              無料ではじめる
            </Link>
            <Link className="rounded-2xl border border-neutral-300 bg-white/80 px-6 py-3 text-sm font-medium hover:bg-white" href="/saved">
              保存一覧を見る
            </Link>
          </div>

          <div className="grid gap-3 text-sm text-neutral-700 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-sm">QR で交換</div>
            <div className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-sm">vCard で保存</div>
            <div className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-sm">連絡先ローカル管理</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-neutral-200/80 backdrop-blur">
          <div className="space-y-4 rounded-[1.75rem] bg-[linear-gradient(160deg,#111111,#374151)] p-6 text-white">
            <p className="text-xs uppercase tracking-[0.28em] text-white/60">Preview</p>
            <h3 className="text-3xl font-semibold">山田 太郎</h3>
            <p className="text-white/70">株式会社XX / 開発部 / マネージャー</p>
            <div className="grid gap-2 rounded-[1.5rem] border border-white/10 bg-white/6 p-4 text-sm">
              <p>TEL 03-xxxx-xxxx</p>
              <p>Mail hello@example.com</p>
              <p>Site https://example.com</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

