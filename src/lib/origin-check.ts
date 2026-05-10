/**
 * 状態変更系 (POST/PUT/DELETE) の API Route で Origin/Referer を確認する。
 * SameSite=Lax cookie が CSRF を主に防ぐが、古いブラウザや特殊条件向けの defense in depth.
 */
export function isAllowedOrigin(req: Request): boolean {
  const baseUrl = process.env.PUBLIC_BASE_URL ?? process.env.AUTH_URL;
  if (!baseUrl) return true; // 環境未設定時はチェックを skip (dev fallback)

  let expected: string;
  try {
    expected = new URL(baseUrl).origin;
  } catch {
    return true;
  }

  const origin = req.headers.get("origin");
  if (origin) {
    return origin === expected;
  }
  // Origin が来ないクライアント (古い fetch/curl) は Referer で判定
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === expected;
    } catch {
      return false;
    }
  }
  // Origin/Referer どちらも無いリクエストは状態変更を拒否
  return false;
}
