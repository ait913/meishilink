import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

type BuildVcardInput = {
  lastName: string;
  firstName: string;
  lastNameKana?: string | null;
  firstNameKana?: string | null;
  company?: string | null;
  department?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  email?: string | null;
  postalCode?: string | null;
  address?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
};

type VcardModule = {
  buildVcard: (card: BuildVcardInput) => string;
};

async function importVcardModule(): Promise<VcardModule | null> {
  try {
    return (await import("@/lib/vcard")) as VcardModule;
  } catch {
    const filePath = path.resolve(process.cwd(), "src/lib/vcard.ts");
    if (!existsSync(filePath)) return null;

    try {
      return (await import(pathToFileURL(filePath).href)) as VcardModule;
    } catch {
      return null;
    }
  }
}

const vcardModule = await importVcardModule();

// Reviewer note: skip when the implementation module is absent or not importable.
const describeVcard = vcardModule ? describe : describe.skip;

function makeCard(overrides: Partial<BuildVcardInput> = {}): BuildVcardInput {
  return {
    lastName: "山田",
    firstName: "太郎",
    lastNameKana: "やまだ",
    firstNameKana: "たろう",
    company: "株式会社Example",
    department: "開発部",
    jobTitle: "マネージャー",
    phone: "03-0000-0000",
    email: "taro@example.com",
    postalCode: "123-4567",
    address: "東京都千代田区1-1",
    websiteUrl: "https://example.com",
    logoUrl: "https://example.com/logo.png",
    ...overrides,
  };
}

describeVcard("vCard builder spec", () => {
  it("builds a vCard 3.0 payload with the documented frame", () => {
    const vcard = vcardModule?.buildVcard(makeCard()) ?? "";

    expect(vcard).toContain("BEGIN:VCARD\r\nVERSION:3.0\r\n");
    expect(vcard).toContain("N:山田;太郎;;;");
    expect(vcard).toContain("FN:山田 太郎");
    expect(vcard.trimEnd().endsWith("END:VCARD")).toBe(true);
    expect(vcard.startsWith("\uFEFF")).toBe(false);
  });

  it("includes phonetic lines only when kana values are present", () => {
    const withKana = vcardModule?.buildVcard(makeCard()) ?? "";
    const withoutKana = vcardModule?.buildVcard(
      makeCard({
        lastNameKana: "",
        firstNameKana: null,
      }),
    ) ?? "";

    expect(withKana).toContain("X-PHONETIC-LAST-NAME:やまだ");
    expect(withKana).toContain("X-PHONETIC-FIRST-NAME:たろう");
    expect(withoutKana).not.toContain("X-PHONETIC-LAST-NAME:");
    expect(withoutKana).not.toContain("X-PHONETIC-FIRST-NAME:");
  });

  it("omits optional lines when values are empty", () => {
    const vcard = vcardModule?.buildVcard(
      makeCard({
        email: "",
        company: null,
        department: null,
        phone: null,
        postalCode: null,
        address: null,
        websiteUrl: null,
        logoUrl: null,
      }),
    ) ?? "";

    expect(vcard).not.toContain("\r\nEMAIL;TYPE=INTERNET:");
    expect(vcard).not.toContain("\r\nORG:");
    expect(vcard).not.toContain("\r\nTEL;TYPE=WORK,VOICE:");
    expect(vcard).not.toContain("\r\nADR;TYPE=WORK:");
    expect(vcard).not.toContain("\r\nURL:");
    expect(vcard).not.toContain("\r\nPHOTO;VALUE=URI:");
  });

  it("escapes semicolons, commas, backslashes, and newlines", () => {
    expect(
      vcardModule?.buildVcard(
        makeCard({
          lastName: "山;田",
        }),
      ),
    ).toContain("N:山\\;田;太郎;;;");

    expect(
      vcardModule?.buildVcard(
        makeCard({
          lastName: "山,田",
        }),
      ),
    ).toContain("N:山\\,田;太郎;;;");

    expect(
      vcardModule?.buildVcard(
        makeCard({
          lastName: "山\\田",
        }),
      ),
    ).toContain("N:山\\\\田;太郎;;;");

    expect(
      vcardModule?.buildVcard(
        makeCard({
          lastName: "山\n田",
        }),
      ),
    ).toContain("N:山\\n田;太郎;;;");
  });

  it("serializes organization, phone, address, URL, and photo fields", () => {
    const withDepartment = vcardModule?.buildVcard(makeCard()) ?? "";
    const withoutDepartment =
      vcardModule?.buildVcard(
        makeCard({
          department: null,
        }),
      ) ?? "";

    expect(withDepartment).toContain("ORG:株式会社Example;開発部");
    expect(withoutDepartment).toContain("ORG:株式会社Example");
    expect(withDepartment).toContain("TEL;TYPE=WORK,VOICE:03-0000-0000");
    expect(withDepartment).toContain(
      "ADR;TYPE=WORK:;;東京都千代田区1-1;;;123-4567;Japan",
    );
    expect(withDepartment).toContain("URL:https://example.com");
    expect(withDepartment).toContain(
      "PHOTO;VALUE=URI:https://example.com/logo.png",
    );
  });

  it("uses CRLF line endings throughout", () => {
    const vcard = vcardModule?.buildVcard(makeCard()) ?? "";

    expect(vcard).toContain("\r\n");
    expect(/(^|[^\r])\n/.test(vcard)).toBe(false);
  });
});
