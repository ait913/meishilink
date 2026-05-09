import Link from "next/link";

import { MeishiLogo } from "@/components/icons/MeishiLogo";

type Props = {
  isLoggedIn: boolean;
  isOwner: boolean;
};

export function ViewerNav({ isLoggedIn, isOwner }: Props) {
  return (
    <nav className="sticky top-0 z-30 flex w-full items-center justify-between gap-3 border-b border-white/40 bg-white/70 px-4 py-2 backdrop-blur md:px-6">
      <Link className="flex items-center gap-2" href="/">
        <MeishiLogo size={28} />
        <span className="text-sm font-semibold tracking-tight text-neutral-950">MeishiLink</span>
      </Link>
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium md:text-sm">
        <Link
          className="inline-flex min-h-9 items-center rounded-full border border-neutral-300 bg-white/80 px-3 py-1 text-neutral-800 hover:bg-white"
          href="/saved"
        >
          保存一覧
        </Link>
        {isLoggedIn ? (
          <>
            <Link
              className="inline-flex min-h-9 items-center rounded-full border border-neutral-300 bg-white/80 px-3 py-1 text-neutral-800 hover:bg-white"
              href="/dashboard"
            >
              ダッシュボード
            </Link>
            {isOwner ? (
              <Link
                className="inline-flex min-h-9 items-center rounded-full bg-neutral-950 px-3 py-1 text-white hover:bg-neutral-800"
                href="/dashboard?tab=exchange"
              >
                交換する
              </Link>
            ) : null}
          </>
        ) : (
          <Link
            className="inline-flex min-h-9 items-center rounded-full bg-neutral-950 px-3 py-1 text-white hover:bg-neutral-800"
            href="/login"
          >
            ログイン
          </Link>
        )}
      </div>
    </nav>
  );
}
