import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/app/(owner)/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  void cookieStore;
  const session = await auth();
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

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <OnboardingForm />
    </main>
  );
}

