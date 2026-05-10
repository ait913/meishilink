import { auth } from "@/auth";
import { isAllowedOrigin } from "@/lib/origin-check";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { saveLogo } from "@/lib/upload";

export async function POST(req: Request): Promise<Response> {
  if (!isAllowedOrigin(req)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // 同一ユーザーから 1 分間に 10 アップロードまで
  if (!rateLimit(`logo:${session.user.id}`, { limit: 10, windowMs: 60_000 })) {
    return Response.json({ error: "too many requests" }, { status: 429 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "no file" }, { status: 400 });
  }

  try {
    const logoPath = await saveLogo(session.user.id, file);
    const card = await prisma.card.update({
      where: { userId: session.user.id },
      data: { logoPath },
      select: { handle: true, updatedAt: true },
    });
    return Response.json({
      logoUrl: `/u/${card.handle}/logo?v=${card.updatedAt.getTime()}`,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "unsupported mime" || error.message === "too large")) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: "upload failed" }, { status: 500 });
  }
}
