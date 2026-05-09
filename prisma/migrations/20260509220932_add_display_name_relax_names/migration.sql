-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "displayName" TEXT,
    "lastName" TEXT,
    "firstName" TEXT,
    "lastNameKana" TEXT,
    "firstNameKana" TEXT,
    "company" TEXT,
    "department" TEXT,
    "jobTitle" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "postalCode" TEXT,
    "address" TEXT,
    "websiteUrl" TEXT,
    "logoPath" TEXT,
    "poem" TEXT,
    "profile" TEXT,
    "snsLinks" TEXT,
    "themeKey" TEXT NOT NULL DEFAULT 'minimal',
    "fontKey" TEXT NOT NULL DEFAULT 'sans',
    "accentColor" TEXT NOT NULL DEFAULT '#111111',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Card" ("accentColor", "address", "company", "createdAt", "department", "email", "firstName", "firstNameKana", "fontKey", "handle", "id", "isPublished", "jobTitle", "lastName", "lastNameKana", "logoPath", "phone", "poem", "postalCode", "profile", "snsLinks", "themeKey", "updatedAt", "userId", "websiteUrl") SELECT "accentColor", "address", "company", "createdAt", "department", "email", "firstName", "firstNameKana", "fontKey", "handle", "id", "isPublished", "jobTitle", "lastName", "lastNameKana", "logoPath", "phone", "poem", "postalCode", "profile", "snsLinks", "themeKey", "updatedAt", "userId", "websiteUrl" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
CREATE UNIQUE INDEX "Card_userId_key" ON "Card"("userId");
CREATE UNIQUE INDEX "Card_handle_key" ON "Card"("handle");
CREATE INDEX "Card_handle_idx" ON "Card"("handle");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
