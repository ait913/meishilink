import { existsSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

type TableInfoRow = {
  name: string;
};

type DatabaseLike = {
  pragma: (sql: string) => TableInfoRow[];
  close: () => void;
};

type DatabaseConstructor = new (
  filename: string,
  options?: { readonly?: boolean; fileMustExist?: boolean },
) => DatabaseLike;

const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
const betterSqlite3Module = (await import("better-sqlite3").catch(() => null)) as
  | { default?: DatabaseConstructor }
  | null;
const Database = betterSqlite3Module?.default ?? null;

// Reviewer note: skip when the database file or sqlite driver is absent.
const describeDbSchema =
  Database && existsSync(dbPath) ? describe : describe.skip;

describeDbSchema("sqlite schema spec", () => {
  let db: DatabaseLike | null = null;

  beforeAll(() => {
    if (!Database || !existsSync(dbPath)) return;
    db = new Database(dbPath, { readonly: true, fileMustExist: true });
  });

  afterAll(() => {
    db?.close();
  });

  it("keeps tokenHash and removes token from ExchangeToken", () => {
    const columns = (db?.pragma('table_info("ExchangeToken")') ?? []).map(
      (row) => row.name,
    );

    expect(columns).toContain("tokenHash");
    expect(columns).not.toContain("token");
  });

  it("removes OAuth token columns from Account", () => {
    const columns = (db?.pragma('table_info("Account")') ?? []).map(
      (row) => row.name,
    );

    expect(columns).not.toContain("refresh_token");
    expect(columns).not.toContain("access_token");
    expect(columns).not.toContain("id_token");
  });

  it("retains the core Account identity columns", () => {
    const columns = (db?.pragma('table_info("Account")') ?? []).map(
      (row) => row.name,
    );

    expect(columns).toContain("provider");
    expect(columns).toContain("providerAccountId");
    expect(columns).toContain("userId");
    expect(columns).toContain("type");
  });
});
