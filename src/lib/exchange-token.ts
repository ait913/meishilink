import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

/** URL-safe 32 字程度のトークンを生成 */
export function generateTokenString(): string {
  return randomBytes(24).toString("base64url");
}

export function hashToken(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

/**
 * 公開ページ用に handle + token を検証。
 * - card.isPrivate === false なら token は無視 (常に通す)
 * - private の場合は token と一致 + 有効 (disabled=false / 期限内) のときだけ通す
 * Returns: card row もしくは null
 */
export async function resolvePublicCard(handle: string, token?: string | null) {
  const card = await prisma.card.findUnique({
    where: { handle },
  });
  if (!card || !card.isPublished) return null;

  if (!card.isPrivate) return card;

  if (!token) return null;

  const tokenHash = hashToken(token);
  const exchange = await prisma.exchangeToken.findUnique({
    where: { tokenHash },
    select: { id: true, cardId: true, disabled: true, expiresAt: true },
  });
  if (!exchange) return null;
  if (exchange.cardId !== card.id) return null;
  if (exchange.disabled) return null;
  if (exchange.expiresAt && exchange.expiresAt.getTime() < Date.now()) return null;

  // best-effort: 使用カウントをインクリメント (失敗してもアクセスは通す)
  prisma.exchangeToken
    .update({
      where: { id: exchange.id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    })
    .catch(() => undefined);

  return card;
}
