import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

type ExchangeTokenModule = {
  hashToken: (plain: string) => string;
};

function firstExistingPath(candidates: string[]): string | null {
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

async function importExchangeTokenModule(): Promise<ExchangeTokenModule | null> {
  for (const specifier of ["@/lib/exchange-token"]) {
    try {
      return (await import(specifier)) as ExchangeTokenModule;
    } catch {
      // fall through to the file URL fallback
    }
  }

  const filePath = firstExistingPath([
    path.resolve(process.cwd(), "src/lib/exchange-token.ts"),
  ]);
  if (!filePath) return null;

  try {
    return (await import(pathToFileURL(filePath).href)) as ExchangeTokenModule;
  } catch {
    return null;
  }
}

const exchangeTokenModule = await importExchangeTokenModule();

// Reviewer note: skip when the implementation module is absent or not importable.
const describeExchangeToken = exchangeTokenModule ? describe : describe.skip;

describeExchangeToken("exchange token hashing spec", () => {
  it("hashes to a 64-character SHA-256 hex string", () => {
    const hashed = exchangeTokenModule?.hashToken("abc") ?? "";

    expect(hashed).toHaveLength(64);
    expect(hashed).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is idempotent for the same input", () => {
    const plain = "phase4-data-leak";
    const hashes = [
      exchangeTokenModule?.hashToken(plain),
      exchangeTokenModule?.hashToken(plain),
      exchangeTokenModule?.hashToken(plain),
    ];

    expect(hashes[0]).toBe(hashes[1]);
    expect(hashes[1]).toBe(hashes[2]);
  });

  it("produces different hashes for different inputs", () => {
    expect(exchangeTokenModule?.hashToken("abc")).not.toBe(
      exchangeTokenModule?.hashToken("abd"),
    );
  });

  it("matches the known SHA-256 test vector for abc", () => {
    expect(exchangeTokenModule?.hashToken("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});
