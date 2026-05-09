export type UAClass = "ios" | "android" | "desktop" | "bot" | "other";

export function classifyUA(ua: string | null | undefined): UAClass {
  if (!ua) {
    return "other";
  }
  if (/bot|spider|crawler|preview|facebookexternalhit/i.test(ua)) {
    return "bot";
  }
  if (/iPhone|iPad|iPod/.test(ua)) {
    return "ios";
  }
  if (/Android/.test(ua)) {
    return "android";
  }
  if (/Macintosh|Windows|Linux/.test(ua)) {
    return "desktop";
  }
  return "other";
}

export function getCountry(): null {
  return null;
}

