"use server";

import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { type ThemeKey, THEMES } from "@/lib/theme";
import { CardInputSchema, type CardInput } from "@/lib/zod-schemas";

function emptyToNull(value?: string | null) {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateCardAction(input: CardInput): Promise<
  | { ok: true }
  | { ok: false; error: string; fields?: Record<string, string> }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = CardInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid",
      fields: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])),
    };
  }

  const updated = await prisma.card.updateMany({
    where: { userId: session.user.id },
    data: {
      lastName: parsed.data.lastName,
      firstName: parsed.data.firstName,
      lastNameKana: emptyToNull(parsed.data.lastNameKana),
      firstNameKana: emptyToNull(parsed.data.firstNameKana),
      company: emptyToNull(parsed.data.company),
      department: emptyToNull(parsed.data.department),
      jobTitle: emptyToNull(parsed.data.jobTitle),
      phone: emptyToNull(parsed.data.phone),
      email: emptyToNull(parsed.data.email),
      postalCode: emptyToNull(parsed.data.postalCode),
      address: emptyToNull(parsed.data.address),
      websiteUrl: emptyToNull(parsed.data.websiteUrl),
      poem: emptyToNull(parsed.data.poem),
      profile: emptyToNull(parsed.data.profile),
      snsLinks: parsed.data.snsLinks && parsed.data.snsLinks.length > 0 ? JSON.stringify(parsed.data.snsLinks) : null,
      themeKey: parsed.data.themeKey,
      fontKey: parsed.data.fontKey,
      accentColor: parsed.data.accentColor,
      isPublished: parsed.data.isPublished,
    },
  });

  if (updated.count === 0) {
    return { ok: false, error: "card not found, do onboarding" };
  }

  return { ok: true };
}

export async function selectThemeAction(themeKey: ThemeKey): Promise<{ ok: true }> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (!(themeKey in THEMES)) {
    redirect("/dashboard/templates");
  }

  await prisma.card.update({
    where: { userId: session.user.id },
    data: { themeKey },
  });

  return { ok: true };
}

export async function deleteAccountAction(): Promise<{ ok: true }> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await prisma.user.delete({
    where: { id: session.user.id },
  });

  await signOut({ redirectTo: "/" });
  return { ok: true };
}

