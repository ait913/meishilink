import { permanentRedirect } from "next/navigation";

import { resolvePublicCard } from "@/lib/exchange-token";
import { normalizeHandle } from "@/lib/handle";
import { buildVcard } from "@/lib/vcard";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ handle: string }> },
): Promise<Response> {
  const { handle: raw } = await params;
  const normalized = normalizeHandle(raw);
  if (!normalized) {
    return new Response("Not Found", { status: 404 });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("t");

  const card = await resolvePublicCard(normalized, token);
  if (!card) {
    return new Response("Not Found", { status: 404 });
  }

  if (raw !== normalized) {
    const suffix = token ? `?t=${encodeURIComponent(token)}` : "";
    permanentRedirect(`/${normalized}/vcard${suffix}`);
  }

  const baseUrl = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
  const logoUrl = card.logoPath
    ? card.isPrivate
      ? token
        ? `${baseUrl}/u/${card.handle}/logo?t=${encodeURIComponent(token)}`
        : null
      : `${baseUrl}/u/${card.handle}/logo?v=${card.updatedAt.getTime()}`
    : null;
  const vcard = buildVcard({
    displayName: card.displayName,
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
    logoUrl,
  });

  // private card (token 付き) は CDN/プロキシに乗せない
  const cacheControl = card.isPrivate
    ? "private, no-store, no-cache, must-revalidate"
    : "public, max-age=300";

  return new Response(vcard, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${card.handle}.vcf"`,
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
