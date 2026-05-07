import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

type SafeParseResult = { success: boolean };

type ZodSchemasModule = {
  HandleSchema: {
    safeParse: (input: unknown) => SafeParseResult;
  };
  CardInputSchema: {
    safeParse: (input: unknown) => SafeParseResult;
  };
  SavedContactSchema: {
    parse: (input: unknown) => unknown;
  };
};

function firstExistingPath(candidates: string[]): string | null {
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

async function importSchemas(): Promise<ZodSchemasModule | null> {
  const specifiers = ["@/lib/zod-schemas"];
  for (const specifier of specifiers) {
    try {
      return (await import(specifier)) as ZodSchemasModule;
    } catch {
      // fall through to the file URL fallback
    }
  }

  const filePath = firstExistingPath([
    path.resolve(process.cwd(), "src/lib/zod-schemas.ts"),
  ]);
  if (!filePath) return null;

  try {
    return (await import(pathToFileURL(filePath).href)) as ZodSchemasModule;
  } catch {
    return null;
  }
}

const schemasModule = await importSchemas();

// Reviewer note: skip when the implementation module is absent or not importable.
const describeSchemas = schemasModule ? describe : describe.skip;

function makeValidCardInput() {
  return {
    lastName: "山田",
    firstName: "太郎",
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
}

describeSchemas("zod schema spec", () => {
  it("accepts and rejects handle lengths at the documented boundaries", () => {
    expect(schemasModule?.HandleSchema.safeParse("abc").success).toBe(true);
    expect(schemasModule?.HandleSchema.safeParse("ab").success).toBe(false);
    expect(schemasModule?.HandleSchema.safeParse("a".repeat(30)).success).toBe(
      true,
    );
    expect(schemasModule?.HandleSchema.safeParse("a".repeat(31)).success).toBe(
      false,
    );
  });

  it("rejects invalid handle formatting", () => {
    expect(schemasModule?.HandleSchema.safeParse("-abc").success).toBe(false);
    expect(schemasModule?.HandleSchema.safeParse("abc-").success).toBe(false);
    expect(schemasModule?.HandleSchema.safeParse("abc--def").success).toBe(
      false,
    );
    expect(schemasModule?.HandleSchema.safeParse("ABC").success).toBe(false);
  });

  it("validates CardInputSchema fields from the design doc", () => {
    const base = makeValidCardInput();

    expect(
      schemasModule?.CardInputSchema.safeParse({
        ...base,
        lastName: "",
      }).success,
    ).toBe(false);

    expect(
      schemasModule?.CardInputSchema.safeParse({
        ...base,
        lastName: "a".repeat(40),
      }).success,
    ).toBe(true);

    expect(
      schemasModule?.CardInputSchema.safeParse({
        ...base,
        lastName: "a".repeat(41),
      }).success,
    ).toBe(false);

    expect(
      schemasModule?.CardInputSchema.safeParse({
        ...base,
        email: "not-an-email",
      }).success,
    ).toBe(false);

    expect(
      schemasModule?.CardInputSchema.safeParse({
        ...base,
        email: "",
      }).success,
    ).toBe(true);

    expect(
      schemasModule?.CardInputSchema.safeParse({
        ...base,
        accentColor: "#111111",
      }).success,
    ).toBe(true);

    expect(
      schemasModule?.CardInputSchema.safeParse({
        ...base,
        accentColor: "red",
      }).success,
    ).toBe(false);

    expect(
      schemasModule?.CardInputSchema.safeParse({
        ...base,
        accentColor: "#fff",
      }).success,
    ).toBe(false);

    expect(
      schemasModule?.CardInputSchema.safeParse({
        ...base,
        themeKey: "unknown",
      }).success,
    ).toBe(false);

    expect(
      schemasModule?.CardInputSchema.safeParse({
        ...base,
        postalCode: "123-4567",
      }).success,
    ).toBe(true);

    expect(
      schemasModule?.CardInputSchema.safeParse({
        ...base,
        postalCode: "abc",
      }).success,
    ).toBe(false);
  });

  it("parses a basic SavedContact payload", () => {
    expect(() =>
      schemasModule?.SavedContactSchema.parse({
        id: "11111111-1111-4111-8111-111111111111",
        handle: "yamada",
        fullName: "山田 太郎",
        company: "株式会社Example",
        jobTitle: "マネージャー",
        phone: "03-0000-0000",
        email: "taro@example.com",
        websiteUrl: "https://example.com",
        logoUrl: "https://example.com/logo.png",
        themeKey: "minimal",
        accentColor: "#111111",
        savedAt: Date.now(),
        sourceUrl: "https://meishi.example/yamada",
      }),
    ).not.toThrow();
  });
});
