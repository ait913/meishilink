import { HandleSchema } from "@/lib/zod-schemas";

export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  "api",
  "_next",
  "static",
  "public",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "login",
  "signup",
  "signout",
  "auth",
  "settings",
  "profile",
  "admin",
  "dashboard",
  "help",
  "legal",
  "about",
  "terms",
  "privacy",
  "u",
  "c",
  "onboarding",
  "verify-request",
  "saved",
]);

export function normalizeHandle(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 30);
}

export function isValidHandle(value: string): boolean {
  return HandleSchema.safeParse(value).success;
}

export function isReservedHandle(value: string): boolean {
  return RESERVED_HANDLES.has(value);
}

