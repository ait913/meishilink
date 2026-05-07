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

export const CardInputSchema = z.object({
  lastName: z.string().min(1).max(40),
  firstName: z.string().min(1).max(40),
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
  themeKey: z.enum(["minimal", "mono", "warm", "navy", "sakura"]),
  fontKey: z.enum(["sans", "serif", "mincho", "gothic", "round"]),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  isPublished: z.boolean(),
});

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
  fontKey: "sans",
  accentColor: "#111111",
  isPublished: true,
};

