import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { deleteAccountAction } from "@/app/(owner)/dashboard/actions";
import { Button } from "@/components/ui/Button";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  void cookieStore;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <section className="space-y-6 rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-lg shadow-neutral-200/60">
        <div>
          <p className="text-sm text-neutral-500">設定</p>
          <h1 className="text-3xl font-semibold">アカウント</h1>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button type="submit" variant="secondary">
            ログアウト
          </Button>
        </form>

        <form
          action={async () => {
            "use server";
            await deleteAccountAction();
          }}
        >
          <Button type="submit" variant="danger">
            退会
          </Button>
        </form>
      </section>
    </main>
  );
}
