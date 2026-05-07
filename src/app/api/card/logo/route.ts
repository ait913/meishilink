import { cookies } from "next/headers";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveLogo } from "@/lib/upload";

export async function POST(req: Request): Promise<Response> {
  const cookieStore = await cookies();
  void cookieStore;
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "file required" }, { status: 400 });
  }

  try {
    const logoPath = await saveLogo(session.user.id, file);
    await prisma.card.update({
      where: { userId: session.user.id },
      data: { logoPath },
    });
    return Response.json({ logoPath });
  } catch (error) {
    if (error instanceof Error && (error.message === "unsupported mime" || error.message === "too large")) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: "upload failed" }, { status: 500 });
  }
}

