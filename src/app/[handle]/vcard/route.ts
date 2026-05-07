import { cookies } from "next/headers";
import { permanentRedirect } from "next/navigation";

import { normalizeHandle } from "@/lib/handle";
import { prisma } from "@/lib/prisma";
import { buildVcard } from "@/lib/vcard";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ handle: string }> },
): Promise<Response> {
  const cookieStore = await cookies();
  void cookieStore;
  const { handle: raw } = await params;
  const normalized = normalizeHandle(raw);
  if (!normalized) {
    return new Response("Not Found", { status: 404 });
  }

  const card = await prisma.card.findUnique({
    where: { handle: normalized },
  });
  if (!card || !card.isPublished) {
    return new Response("Not Found", { status: 404 });
  }

  if (raw !== normalized) {
    permanentRedirect(`/${normalized}/vcard`);
  }

  const baseUrl = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
  const vcard = buildVcard({
    lastName: card.lastName,
    firstName: card.firstName,
    lastNameKana: card.lastNameKana,
    firstNameKana: card.firstNameKana,
    company: card.company,
    department: card.department,
    jobTitle: card.jobTitle,
    phone: card.phone,
    email: card.email,
    postalCode: card.postalCode,
    address: card.address,
    websiteUrl: card.websiteUrl,
    logoUrl: card.logoPath ? `${baseUrl}${card.logoPath}` : null,
  });

  return new Response(vcard, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${card.handle}.vcf"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}

