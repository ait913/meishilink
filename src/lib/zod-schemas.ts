import { z } from "zod";

export const HandleSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "英数字とハイフン、先頭末尾はハイフン不可")
  .refine((value) => !value.includes("--"), "連続ハイフン不可");

export const SnsLinkSchema = z.object({
  label: z.string().min(1).max(20),
  url: z.string().url().max(500),
});

const OptionalText = (max: number) => z.string().max(max).optional().or(z.literal(""));

export const CardInputSchema = z
  .object({
    displayName: OptionalText(60),
    lastName: OptionalText(40),
    firstName: OptionalText(40),
    lastNameKana: OptionalText(60),
    firstNameKana: OptionalText(60),
    company: OptionalText(80),
    department: OptionalText(80),
    jobTitle: OptionalText(80),
    phone: z.string().regex(/^[0-9+\-() ]{0,20}$/).optional().or(z.literal("")),
    email: z.string().email().max(120).optional().or(z.literal("")),
    postalCode: z.string().regex(/^[0-9]{0,3}-?[0-9]{0,4}$/).optional().or(z.literal("")),
    address: OptionalText(200),
    websiteUrl: z.string().url().max(500).optional().or(z.literal("")),
    poem: OptionalText(200),
    profile: OptionalText(500),
    snsLinks: z.array(SnsLinkSchema).max(10).optional(),
    themeKey: z.enum(["minimal", "mono", "warm", "navy", "sakura", "mincho", "washi", "letterpress", "engineer"]),
    paletteKey: z.string().max(40).optional().or(z.literal("")),
    fontKey: z.enum(["sans", "serif", "mincho", "gothic", "round", "display", "mono"]),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    isPublished: z.boolean(),
    isPrivate: z.boolean().optional(),
  })
  .refine(
    (data) => Boolean((data.displayName ?? "").trim() || (data.lastName ?? "").trim() || (data.firstName ?? "").trim()),
    {
      message: "表示名 (または氏名) を入力してください",
      path: ["displayName"],
    },
  );

export const HandleClaimSchema = z.object({
  handle: HandleSchema,
});

export const SavedContactSchema = z.object({
  id: z.string(),
  handle: z.string(),
  fullName: z.string(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  websiteUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  themeKey: z.string(),
  accentColor: z.string(),
  savedAt: z.number(),
  sourceUrl: z.string(),
});

export type CardInput = z.infer<typeof CardInputSchema>;
export type HandleClaim = z.infer<typeof HandleClaimSchema>;
export type SavedContact = z.infer<typeof SavedContactSchema>;

export const defaultCardInput: CardInput = {
  displayName: "",
  lastName: "",
  firstName: "",
  lastNameKana: "",
  firstNameKana: "",
  company: "",
  department: "",
  jobTitle: "",
  phone: "",
  email: "",
  postalCode: "",
  address: "",
  websiteUrl: "",
  poem: "",
  profile: "",
  snsLinks: [],
  themeKey: "minimal",
  paletteKey: "",
  fontKey: "sans",
  accentColor: "#111111",
  isPublished: true,
  isPrivate: false,
};

/** 表示用フルネーム計算: displayName 優先、なければ lastName + firstName を結合 */
export function getDisplayName(card: {
  displayName?: string | null;
  lastName?: string | null;
  firstName?: string | null;
}): string {
  if (card.displayName?.trim()) return card.displayName.trim();
  return [card.lastName, card.firstName].filter(Boolean).join(" ").trim();
}
