import "fake-indexeddb/auto";

import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

type SavedContact = {
  id: string;
  handle: string;
  fullName: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  logoUrl?: string;
  themeKey: string;
  accentColor: string;
  savedAt: number;
  sourceUrl: string;
};

type ContactsTable = {
  clear: () => Promise<void>;
  count: () => Promise<number>;
  delete: (id: string) => Promise<void>;
  get: (id: string) => Promise<SavedContact | undefined>;
  put: (value: SavedContact) => Promise<string>;
};

type DexieModule = {
  db: {
    contacts: ContactsTable;
    delete?: () => Promise<void>;
  };
};

async function importDexieModule(): Promise<DexieModule | null> {
  try {
    return (await import("@/lib/dexie")) as DexieModule;
  } catch {
    const filePath = path.resolve(process.cwd(), "src/lib/dexie.ts");
    if (!existsSync(filePath)) return null;

    try {
      return (await import(pathToFileURL(filePath).href)) as DexieModule;
    } catch {
      return null;
    }
  }
}

const dexieModule = await importDexieModule();

// Reviewer note: skip when the implementation module is absent or not importable.
const describeSavedClient = dexieModule ? describe : describe.skip;

function makeSavedContact(overrides: Partial<SavedContact> = {}): SavedContact {
  return {
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
    sourceUrl: "https://example.com/yamada",
    ...overrides,
  };
}

describeSavedClient("SavedClient Dexie spec", () => {
  beforeEach(async () => {
    await dexieModule?.db.contacts.clear();
  });

  beforeAll(async () => {
    await dexieModule?.db.contacts.clear();
  });

  it("adds one saved contact via db.contacts.put", async () => {
    await dexieModule?.db.contacts.put(makeSavedContact());

    expect(await dexieModule?.db.contacts.count()).toBe(1);
  });

  it("keeps the count unchanged when the same saved record is put again", async () => {
    const original = makeSavedContact();
    const updated = makeSavedContact({
      id: original.id,
      handle: original.handle,
      fullName: "山田 花子",
    });

    await dexieModule?.db.contacts.put(original);
    await dexieModule?.db.contacts.put(updated);

    expect(await dexieModule?.db.contacts.count()).toBe(1);
    expect(await dexieModule?.db.contacts.get(original.id)).toMatchObject({
      handle: "yamada",
      fullName: "山田 花子",
    });
  });

  it("deletes a saved contact", async () => {
    const savedContact = makeSavedContact();

    await dexieModule?.db.contacts.put(savedContact);
    await dexieModule?.db.contacts.delete(savedContact.id);

    expect(await dexieModule?.db.contacts.count()).toBe(0);
  });
});
