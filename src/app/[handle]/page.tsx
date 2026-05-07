import { cookies } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";

import { PublicCard } from "@/app/[handle]/PublicCard";
import { ViewerActions } from "@/app/[handle]/ViewerActions";
import { normalizeHandle } from "@/lib/handle";
import { prisma } from "@/lib/prisma";

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

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const cookieStore = await cookies();
  void cookieStore;
  const { handle: raw } = await params;
  const normalized = normalizeHandle(raw);
  if (!normalized) {
    notFound();
  }

  const card = await prisma.card.findUnique({
    where: { handle: normalized },
  });
  if (!card || !card.isPublished) {
    notFound();
  }

  if (raw !== normalized) {
    permanentRedirect(`/${normalized}`);
  }

  const snsLinks = parseSnsLinks(card.snsLinks);
  const fullName = `${card.lastName} ${card.firstName}`;
  const publicUrl = `${process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"}/${card.handle}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
      <div className="w-full space-y-6">
        <PublicCard
          card={{
            ...card,
            snsLinks,
          }}
        />
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-neutral-200/60">
          <ViewerActions
            accentColor={card.accentColor}
            company={card.company}
            email={card.email}
            fullName={fullName}
            handle={card.handle}
            jobTitle={card.jobTitle}
            logoUrl={card.logoPath}
            phone={card.phone}
            poem={card.poem}
            profile={card.profile}
            snsLinks={snsLinks}
            sourceUrl={publicUrl}
            themeKey={card.themeKey}
            websiteUrl={card.websiteUrl}
          />
        </section>
      </div>
    </main>
  );
}
