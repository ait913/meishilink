import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/app/(owner)/onboarding/OnboardingForm";

export const metadata: Metadata = {
  title: "はじめての名刺登録",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const existing = await prisma.card.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (existing) {
    redirect("/dashboard");
  }

  const baseUrl = process.env.PUBLIC_BASE_URL ?? "https://meishilink.appily.run";
  const baseHost = (() => {
    try {
      return new URL(baseUrl).host;
    } catch {
      return "meishilink.appily.run";
    }
  })();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <OnboardingForm baseHost={baseHost} />
    </main>
  );
}

