/*
  Warnings:

  - You are about to drop the column `access_token` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `id_token` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `ExchangeToken` table. All the data in the column will be lost.
  - Added the required column `tokenHash` to the `ExchangeToken` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
UPDATE "Account" SET "refresh_token" = NULL, "access_token" = NULL, "id_token" = NULL;
CREATE TABLE "new_Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "session_state" TEXT,

    PRIMARY KEY ("provider", "providerAccountId"),
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("expires_at", "provider", "providerAccountId", "scope", "session_state", "token_type", "type", "userId") SELECT "expires_at", "provider", "providerAccountId", "scope", "session_state", "token_type", "type", "userId" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
DELETE FROM "ExchangeToken";
CREATE TABLE "new_ExchangeToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "label" TEXT,
    "expiresAt" DATETIME,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExchangeToken_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ExchangeToken" ("cardId", "createdAt", "disabled", "expiresAt", "id", "label", "lastUsedAt", "usageCount") SELECT "cardId", "createdAt", "disabled", "expiresAt", "id", "label", "lastUsedAt", "usageCount" FROM "ExchangeToken";
DROP TABLE "ExchangeToken";
ALTER TABLE "new_ExchangeToken" RENAME TO "ExchangeToken";
CREATE UNIQUE INDEX "ExchangeToken_tokenHash_key" ON "ExchangeToken"("tokenHash");
CREATE INDEX "ExchangeToken_cardId_idx" ON "ExchangeToken"("cardId");
UPDATE "Card"
SET "logoPath" = 'logo.webp'
WHERE "logoPath" IS NOT NULL AND "logoPath" != '';
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
