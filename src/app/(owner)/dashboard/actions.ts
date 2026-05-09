"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { type ThemeKey, THEMES } from "@/lib/theme";
import { CardInputSchema, type CardInput } from "@/lib/zod-schemas";

async function resolveUserId(session: { user?: { id?: string | null; email?: string | null } } | null) {
  const claimed = session?.user?.id ?? null;
  if (claimed) {
    const hit = await prisma.user.findUnique({ where: { id: claimed }, select: { id: true } });
    if (hit) return hit.id;
  }
  const email = session?.user?.email ?? null;
  if (!email) return null;
  const byEmail = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return byEmail?.id ?? null;
}

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
  const userId = await resolveUserId(session);
  if (!userId) {
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
    where: { userId },
    data: {
      displayName: emptyToNull(parsed.data.displayName),
      lastName: emptyToNull(parsed.data.lastName),
      firstName: emptyToNull(parsed.data.firstName),
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
      paletteKey: emptyToNull(parsed.data.paletteKey),
      fontKey: parsed.data.fontKey,
      accentColor: parsed.data.accentColor,
      isPublished: parsed.data.isPublished,
      isPrivate: Boolean(parsed.data.isPrivate),
    },
  });

  if (updated.count === 0) {
    return { ok: false, error: "card not found, do onboarding" };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function selectThemeAction(themeKey: ThemeKey): Promise<{ ok: true }> {
  const session = await auth();
  const userId = await resolveUserId(session);
  if (!userId) {
    redirect("/login");
  }
  if (!(themeKey in THEMES)) {
    redirect("/dashboard/templates");
  }

  await prisma.card.update({
    where: { userId },
    data: { themeKey },
  });

  revalidatePath("/dashboard/templates");
  revalidatePath("/dashboard");
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

