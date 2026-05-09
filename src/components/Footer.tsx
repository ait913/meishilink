import Link from "next/link";

export function Footer({ operatorUrl }: { operatorUrl?: string }) {
  return (
    <footer className="mb-10 mt-16 flex flex-col gap-3 border-t border-neutral-200 pt-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
      <p>© {new Date().getFullYear()} MeishiLink</p>
      <nav className="flex flex-wrap gap-x-4 gap-y-2">
        <Link className="hover:text-neutral-800" href="/legal/terms">
          利用規約
        </Link>
        <Link className="hover:text-neutral-800" href="/legal/privacy">
          プライバシーポリシー
        </Link>
        {operatorUrl ? (
          <a className="hover:text-neutral-800" href={operatorUrl} rel="noopener" target="_blank">
            運営者情報
          </a>
        ) : (
          <span className="text-neutral-400">運営者情報 (準備中)</span>
        )}
      </nav>
    </footer>
  );
}
