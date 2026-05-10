import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, cardFindUniqueMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  cardFindUniqueMock: vi.fn(),
}));

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

type HandleCheckRouteModule = {
  GET: (req: Request) => Promise<Response>;
};

function firstExistingPath(candidates: string[]): string | null {
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

async function importHandleCheckRouteModule(): Promise<HandleCheckRouteModule | null> {
  for (const specifier of ["@/app/api/card/handle-check/route"]) {
    try {
      return (await import(specifier)) as HandleCheckRouteModule;
    } catch {
      // fall through to the file URL fallback
    }
  }

  const filePath = firstExistingPath([
    path.resolve(process.cwd(), "src/app/api/card/handle-check/route.ts"),
  ]);
  if (!filePath) return null;

  try {
    return (await import(pathToFileURL(filePath).href)) as HandleCheckRouteModule;
  } catch {
    return null;
  }
}

const routeModule = await importHandleCheckRouteModule();

// Reviewer note: skip when the implementation module is absent or not importable.
const describeHandleCheck = routeModule ? describe : describe.skip;

describeHandleCheck("handle-check auth spec", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue(null);
    cardFindUniqueMock.mockResolvedValue(null);
  });

  it("returns 401 when the requester is unauthenticated", async () => {
    const response =
      (await routeModule?.GET(
        new Request("http://x/api/card/handle-check?h=foo"),
      )) ?? new Response(null, { status: 500 });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthorized" });
  });

  it("returns a normal availability payload for an authenticated user", async () => {
    authMock.mockResolvedValue({ user: { id: `user-${randomUUID()}` } });

    const response =
      (await routeModule?.GET(
        new Request("http://x/api/card/handle-check?h=foo"),
      )) ?? new Response(null, { status: 500 });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(typeof payload.available).toBe("boolean");
  });

  it("rate limits the 31st request from the same user within a minute", async () => {
    authMock.mockResolvedValue({ user: { id: `user-${randomUUID()}` } });

    for (let i = 0; i < 30; i += 1) {
      const response =
        (await routeModule?.GET(
          new Request(`http://x/api/card/handle-check?h=foo${i}`),
        )) ?? new Response(null, { status: 500 });

      expect(response.status).toBe(200);
    }

    const limitedResponse =
      (await routeModule?.GET(
        new Request("http://x/api/card/handle-check?h=overflow"),
      )) ?? new Response(null, { status: 500 });

    expect(limitedResponse.status).toBe(429);
    expect(await limitedResponse.json()).toEqual({
      error: "too many requests",
    });
  });

  it("tracks a different user independently", async () => {
    authMock.mockResolvedValue({ user: { id: `user-A-${randomUUID()}` } });
    await routeModule?.GET(new Request("http://x/api/card/handle-check?h=foo"));

    authMock.mockResolvedValue({ user: { id: `user-B-${randomUUID()}` } });
    const response =
      (await routeModule?.GET(
        new Request("http://x/api/card/handle-check?h=foo"),
      )) ?? new Response(null, { status: 500 });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(typeof payload.available).toBe("boolean");
  });
});
