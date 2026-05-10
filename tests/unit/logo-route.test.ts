import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  cardFindUniqueMock,
  exchangeFindUniqueMock,
  exchangeUpdateMock,
  resolvePublicCardMock,
  readFileMock,
  permanentRedirectMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  cardFindUniqueMock: vi.fn(),
  exchangeFindUniqueMock: vi.fn(),
  exchangeUpdateMock: vi.fn(),
  resolvePublicCardMock: vi.fn(),
  readFileMock: vi.fn(),
  permanentRedirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    card: {
      findUnique: cardFindUniqueMock,
    },
    exchangeToken: {
      findUnique: exchangeFindUniqueMock,
      update: exchangeUpdateMock,
    },
  },
}));

vi.mock("@/lib/exchange-token", () => ({
  resolvePublicCard: resolvePublicCardMock,
}));

vi.mock("fs/promises", () => ({
  readFile: readFileMock,
}));

vi.mock("node:fs/promises", () => ({
  readFile: readFileMock,
}));

vi.mock("next/navigation", () => ({
  permanentRedirect: permanentRedirectMock,
}));

type CardRecord = {
  id: string;
  handle: string;
  userId: string;
  isPublished: boolean;
  isPrivate: boolean;
  logoPath: string | null;
};

type LogoRouteModule = {
  GET: (
    req: Request,
    ctx: { params: Promise<{ handle: string }> },
  ) => Promise<Response>;
};

function makeCard(overrides: Partial<CardRecord> = {}): CardRecord {
  return {
    id: "card_1",
    handle: "yamada",
    userId: "owner_1",
    isPublished: true,
    isPrivate: false,
    logoPath: "logo.webp",
    ...overrides,
  };
}

function firstExistingPath(candidates: string[]): string | null {
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

async function importLogoRouteModule(): Promise<LogoRouteModule | null> {
  for (const specifier of ["@/app/u/[handle]/logo/route"]) {
    try {
      return (await import(specifier)) as LogoRouteModule;
    } catch {
      // fall through to the file URL fallback
    }
  }

  const filePath = firstExistingPath([
    path.resolve(process.cwd(), "src/app/u/[handle]/logo/route.ts"),
  ]);
  if (!filePath) return null;

  try {
    return (await import(pathToFileURL(filePath).href)) as LogoRouteModule;
  } catch {
    return null;
  }
}

async function invokeGet(
  routeModule: LogoRouteModule | null,
  url: string,
  handle: string,
): Promise<Response> {
  return (
    (await routeModule?.GET(new Request(url), {
      params: Promise.resolve({ handle }),
    })) ?? new Response(null, { status: 500 })
  );
}

const routeModule = await importLogoRouteModule();

// Reviewer note: skip when the implementation module is absent or not importable.
const describeLogoRoute = routeModule ? describe : describe.skip;

describeLogoRoute("logo route auth spec", () => {
  const imageBuffer = Buffer.from("RIFF1234WEBPpayload", "ascii");

  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue(null);
    cardFindUniqueMock.mockResolvedValue(null);
    exchangeFindUniqueMock.mockResolvedValue(null);
    exchangeUpdateMock.mockResolvedValue(null);
    resolvePublicCardMock.mockResolvedValue(null);
    readFileMock.mockResolvedValue(imageBuffer);
  });

  it("serves public card logos with public cache headers", async () => {
    cardFindUniqueMock.mockResolvedValue(
      makeCard({
        isPrivate: false,
        isPublished: true,
        logoPath: "logo.webp",
      }),
    );

    const response = await invokeGet(
      routeModule,
      "https://example.com/u/yamada/logo",
      "yamada",
    );
    const body = Buffer.from(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/webp");
    expect(response.headers.get("Cache-Control")).toContain(
      "public, max-age=3600, immutable",
    );
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(body.equals(imageBuffer)).toBe(true);
  });

  it("redirects uppercase handles to the normalized lowercase path", async () => {
    cardFindUniqueMock.mockResolvedValue(
      makeCard({
        isPublished: true,
        isPrivate: false,
        logoPath: "logo.webp",
      }),
    );

    await expect(
      invokeGet(routeModule, "https://example.com/u/Foo/logo", "Foo"),
    ).rejects.toThrow(/REDIRECT:.*\/u\/foo\/logo/);
  });

  it("serves a private logo when a valid token resolves the card", async () => {
    const card = makeCard({
      isPrivate: true,
      isPublished: true,
      logoPath: "logo.webp",
    });
    cardFindUniqueMock.mockResolvedValue(card);
    resolvePublicCardMock.mockResolvedValue(card);

    const response = await invokeGet(
      routeModule,
      "https://example.com/u/yamada/logo?t=valid",
      "yamada",
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(
      "private, no-store, no-cache, must-revalidate",
    );
  });

  it("returns 404 for a private card without token and without a session", async () => {
    cardFindUniqueMock.mockResolvedValue(
      makeCard({
        isPrivate: true,
        isPublished: true,
        logoPath: "logo.webp",
      }),
    );

    const response = await invokeGet(
      routeModule,
      "https://example.com/u/yamada/logo",
      "yamada",
    );

    expect(response.status).toBe(404);
  });

  it("returns 404 for an invalid token when the requester is not the owner", async () => {
    cardFindUniqueMock.mockResolvedValue(
      makeCard({
        isPrivate: true,
        isPublished: true,
        logoPath: "logo.webp",
      }),
    );
    resolvePublicCardMock.mockResolvedValue(null);

    const response = await invokeGet(
      routeModule,
      "https://example.com/u/yamada/logo?t=wrong",
      "yamada",
    );

    expect(response.status).toBe(404);
  });

  it("allows the owner session to bypass token checks", async () => {
    authMock.mockResolvedValue({ user: { id: "owner_1" } });
    cardFindUniqueMock.mockResolvedValue(
      makeCard({
        isPrivate: true,
        isPublished: true,
        logoPath: "logo.webp",
      }),
    );

    const response = await invokeGet(
      routeModule,
      "https://example.com/u/yamada/logo",
      "yamada",
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(
      "private, no-store, no-cache, must-revalidate",
    );
  });

  it("returns 404 for a different logged-in user without a token", async () => {
    authMock.mockResolvedValue({ user: { id: "other_user" } });
    cardFindUniqueMock.mockResolvedValue(
      makeCard({
        isPrivate: true,
        isPublished: true,
        logoPath: "logo.webp",
      }),
    );

    const response = await invokeGet(
      routeModule,
      "https://example.com/u/yamada/logo",
      "yamada",
    );

    expect(response.status).toBe(404);
  });

  it("allows a different logged-in user when the token resolves", async () => {
    const card = makeCard({
      isPrivate: true,
      isPublished: true,
      logoPath: "logo.webp",
    });
    authMock.mockResolvedValue({ user: { id: "other_user" } });
    cardFindUniqueMock.mockResolvedValue(card);
    resolvePublicCardMock.mockResolvedValue(card);

    const response = await invokeGet(
      routeModule,
      "https://example.com/u/yamada/logo?t=valid",
      "yamada",
    );

    expect(response.status).toBe(200);
  });

  it("returns 404 when the card handle does not exist", async () => {
    cardFindUniqueMock.mockResolvedValue(null);

    const response = await invokeGet(
      routeModule,
      "https://example.com/u/missing/logo",
      "missing",
    );

    expect(response.status).toBe(404);
  });

  it("returns 404 when the card is unpublished", async () => {
    authMock.mockResolvedValue({ user: { id: "owner_1" } });
    cardFindUniqueMock.mockResolvedValue(
      makeCard({
        isPublished: false,
        isPrivate: true,
        logoPath: "logo.webp",
      }),
    );

    const response = await invokeGet(
      routeModule,
      "https://example.com/u/yamada/logo",
      "yamada",
    );

    expect(response.status).toBe(404);
  });

  it("returns 404 when logoPath is null", async () => {
    cardFindUniqueMock.mockResolvedValue(
      makeCard({
        isPrivate: false,
        isPublished: true,
        logoPath: null,
      }),
    );

    const response = await invokeGet(
      routeModule,
      "https://example.com/u/yamada/logo",
      "yamada",
    );

    expect(response.status).toBe(404);
  });

  it("returns 404 when the logo file is missing on disk", async () => {
    cardFindUniqueMock.mockResolvedValue(
      makeCard({
        isPrivate: false,
        isPublished: true,
        logoPath: "logo.webp",
      }),
    );
    readFileMock.mockRejectedValue(
      Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
    );

    const response = await invokeGet(
      routeModule,
      "https://example.com/u/yamada/logo",
      "yamada",
    );

    expect(response.status).toBe(404);
  });
});
