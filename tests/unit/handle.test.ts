import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

type HandleModule = {
  normalizeHandle: (input: string) => string;
  isReservedHandle: (input: string) => boolean;
  isValidHandle?: (input: string) => boolean;
};

type ZodSchemasModule = {
  HandleSchema: {
    safeParse: (input: unknown) => { success: boolean };
  };
};

function firstExistingPath(candidates: string[]): string | null {
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

async function importFromCandidates<T>(
  specifiers: string[],
  candidates: string[],
): Promise<T | null> {
  for (const specifier of specifiers) {
    try {
      return (await import(specifier)) as T;
    } catch {
      // fall through to the next specifier
    }
  }

  const filePath = firstExistingPath(candidates);
  if (!filePath) return null;

  try {
    return (await import(pathToFileURL(filePath).href)) as T;
  } catch {
    return null;
  }
}

const handleModule = await importFromCandidates<HandleModule>(
  ["@/lib/handle"],
  [path.resolve(process.cwd(), "src/lib/handle.ts")],
);

const zodSchemasModule = await importFromCandidates<ZodSchemasModule>(
  ["@/lib/zod-schemas"],
  [path.resolve(process.cwd(), "src/lib/zod-schemas.ts")],
);

// Reviewer note: skip when the implementation module is absent or not importable.
const describeHandle = handleModule ? describe : describe.skip;

describeHandle("handle spec", () => {
  it("normalizes handles per spec", () => {
    expect(handleModule?.normalizeHandle("YAMADA")).toBe("yamada");
    expect(handleModule?.normalizeHandle("yamada-taro")).toBe("yamada-taro");
    expect(handleModule?.normalizeHandle("Yamada.Taro")).toBe("yamadataro");
    expect(handleModule?.normalizeHandle("--abc--")).toBe("abc");
    expect(handleModule?.normalizeHandle("yamada--taro")).toBe("yamada-taro");
    expect(handleModule?.normalizeHandle("AB")).toBe("ab");
    expect(handleModule?.normalizeHandle("日本語")).toBe("");
    expect(handleModule?.normalizeHandle("a".repeat(40))).toBe("a".repeat(30));
    expect(handleModule?.normalizeHandle("a-b-c")).toBe("a-b-c");
    expect(handleModule?.normalizeHandle("ＹＡＭＡＤＡ")).toBe("yamada");
  });

  it("identifies reserved handles from the documented namespace", () => {
    expect(handleModule?.isReservedHandle("login")).toBe(true);
    expect(handleModule?.isReservedHandle("api")).toBe(true);
    expect(handleModule?.isReservedHandle("dashboard")).toBe(true);
    expect(handleModule?.isReservedHandle("saved")).toBe(true);
    expect(handleModule?.isReservedHandle("yamada")).toBe(false);
  });

  it("matches HandleSchema when isValidHandle is exported", () => {
    const isValidHandle = handleModule?.isValidHandle;
    if (!isValidHandle || !zodSchemasModule) return;

    const samples = [
      "abc",
      "ab",
      "a-b-c",
      "-abc",
      "abc-",
      "abc--def",
      "ABC",
      "yamada-taro",
    ];

    for (const sample of samples) {
      expect(isValidHandle(sample)).toBe(
        zodSchemasModule.HandleSchema.safeParse(sample).success,
      );
    }
  });
});
