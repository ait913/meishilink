import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { auth, signIn } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";

export const metadata: Metadata = {
  title: "ログイン",
  description: "メールまたは Google アカウントで MeishiLink にログインします。",
};

export default async function LoginPage() {  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  const testMode =
    process.env.AUTH_TEST_MODE === "true" && process.env.NODE_ENV !== "production";

  async function signInWithEmail(formData: FormData) {
    "use server";

    const headerList = await headers();
    const ip =
      headerList.get("cf-connecting-ip") ??
      headerList.get("x-real-ip") ??
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const email = String(formData.get("email") ?? "").toLowerCase().trim();
    const ipOk = rateLimit(`magic-ip:${ip}`, { limit: 5, windowMs: 10 * 60_000 });
    const mailOk = email
      ? rateLimit(`magic-mail:${email}`, { limit: 3, windowMs: 10 * 60_000 })
      : true;
    // 制限超過でも UX は同じ画面 (アドレス存在判定を防ぐ)
    if (ipOk && mailOk && email) {
      await signIn("nodemailer", { email, redirect: false });
    }
    redirect("/verify-request");
  }

  async function signInWithGoogle() {
    "use server";

    await signIn("google", { redirectTo: "/dashboard" });
  }

  async function signInWithTest(formData: FormData) {
    "use server";

    const email = String(formData.get("testEmail") ?? "");
    await signIn("test-credentials", { email, redirectTo: "/dashboard" });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-12">
      <div className="w-full rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-xl shadow-neutral-200/70 backdrop-blur">
        <div className="mb-8 space-y-2">
          <p className="text-sm text-neutral-500">ログイン</p>
          <h1 className="text-3xl font-semibold">MeishiLink に入る</h1>
        </div>

        <form action={signInWithEmail} className="space-y-4">
          <Input autoComplete="email" label="メールアドレス" name="email" placeholder="you@example.com" required type="email" />
          <Button fullWidth type="submit">
            メールでログイン
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4 text-xs text-neutral-400">
          <div className="h-px flex-1 bg-neutral-200" />
          <span>または</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <form action={signInWithGoogle} className="space-y-4">
          <Button disabled={!googleEnabled} fullWidth type="submit" variant="secondary">
            Google でログイン
          </Button>
        </form>

        {testMode ? (
          <form action={signInWithTest} className="mt-6 space-y-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
            <Input defaultValue="dev@example.com" label="開発用メール" name="testEmail" required type="email" />
            <Button fullWidth type="submit" variant="secondary">
              開発用で直接ログイン
            </Button>
          </form>
        ) : null}

        <p className="mt-6 text-sm text-neutral-500">
          閲覧者として保存した連絡先を見る場合は <Link className="font-medium text-neutral-900 underline" href="/saved">/saved</Link>
        </p>
      </div>
    </main>
  );
}

