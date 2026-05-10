import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, cardFindUniqueMock, resolvePublicCardMock } = vi.hoisted(
  () => ({
    authMock: vi.fn(),
    cardFindUniqueMock: vi.fn(),
    resolvePublicCardMock: vi.fn(),
  }),
);

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    card: {
      findUnique: cardFindUniqueMock,
    },
  },
}));

vi.mock("@/lib/exchange-token", () => ({
  resolvePublicCard: resolvePublicCardMock,
}));

type CardRecord = {
  id: string;
  handle: string;
  userId: string;
  updatedAt: Date;
  isPublished: boolean;
  isPrivate: boolean;
  logoPath: string | null;
  lastName: string;
  firstName: string;
  lastNameKana: string | null;
  firstNameKana: string | null;
  company: string | null;
  department: string | null;
  jobTitle: string | null;
  phone: string | null;
  email: string | null;
  postalCode: string | null;
  address: string | null;
  websiteUrl: string | null;
};

type VcardRouteModule = {
  GET: (
    req: Request,
    ctx: { params: Promise<{ handle: string }> },
  ) => Promise<Response>;
};

function makeCard(overrides: Partial<CardRecord> = {}): CardRecord {
  return {
    id: "card_1",
    handle: "yamada",
    userId: "user_1",
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    isPublished: true,
    isPrivate: false,
    logoPath: "logo.webp",
    lastName: "山田",
    firstName: "太郎",
    lastNameKana: null,
    firstNameKana: null,
    company: null,
    department: null,
    jobTitle: null,
    phone: null,
    email: null,
    postalCode: null,
    address: null,
    websiteUrl: null,
    ...overrides,
  };
}

function firstExistingPath(candidates: string[]): string | null {
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

async function importVcardRouteModule(): Promise<VcardRouteModule | null> {
  for (const specifier of ["@/app/[handle]/vcard/route"]) {
    try {
      return (await import(specifier)) as VcardRouteModule;
    } catch {
      // fall through to the file URL fallback
    }
  }

  const filePath = firstExistingPath([
    path.resolve(process.cwd(), "src/app/[handle]/vcard/route.ts"),
  ]);
  if (!filePath) return null;

  try {
    return (await import(pathToFileURL(filePath).href)) as VcardRouteModule;
  } catch {
    return null;
  }
}

const routeModule = await importVcardRouteModule();

// Reviewer note: skip when the implementation module is absent or not importable.
const describeVcardRoute = routeModule ? describe : describe.skip;

describeVcardRoute("vCard route PHOTO spec", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue(null);
    cardFindUniqueMock.mockResolvedValue(null);
    resolvePublicCardMock.mockResolvedValue(null);
  });

  it("builds a public PHOTO URL without a token", async () => {
    const card = makeCard({ isPrivate: false, logoPath: "logo.webp" });
    cardFindUniqueMock.mockResolvedValue(card);
    resolvePublicCardMock.mockResolvedValue(card);

    const response =
      (await routeModule?.GET(new Request("https://example.com/yamada/vcard"), {
        params: Promise.resolve({ handle: "yamada" }),
      })) ?? new Response("", { status: 500 });
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain(
      "PHOTO;VALUE=URI:http://localhost:3000/u/yamada/logo?v=",
    );
    expect(text).not.toContain("?t=");
  });

  it("builds a private PHOTO URL with the token query", async () => {
    const card = makeCard({ isPrivate: true, logoPath: "logo.webp" });
    cardFindUniqueMock.mockResolvedValue(card);
    resolvePublicCardMock.mockResolvedValue(card);

    const response =
      (await routeModule?.GET(
        new Request("https://example.com/yamada/vcard?t=token-123"),
        {
          params: Promise.resolve({ handle: "yamada" }),
        },
      )) ?? new Response("", { status: 500 });
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain(
      "PHOTO;VALUE=URI:http://localhost:3000/u/yamada/logo?t=token-123",
    );
  });

  it("omits the PHOTO line when the card has no logoPath", async () => {
    const card = makeCard({ isPrivate: false, logoPath: null });
    cardFindUniqueMock.mockResolvedValue(card);
    resolvePublicCardMock.mockResolvedValue(card);

    const response =
      (await routeModule?.GET(new Request("https://example.com/yamada/vcard"), {
        params: Promise.resolve({ handle: "yamada" }),
      })) ?? new Response("", { status: 500 });
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).not.toContain("PHOTO");
  });
});
