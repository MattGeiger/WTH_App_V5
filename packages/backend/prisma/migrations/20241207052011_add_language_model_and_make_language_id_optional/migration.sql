/*
  Warnings:

  - You are about to drop the column `language` on the `Translation` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Language" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Translation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "translatedText" TEXT NOT NULL,
    "categoryId" INTEGER,
    "foodItemId" INTEGER,
    "languageId" INTEGER,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Translation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Translation_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Translation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Translation" ("categoryId", "createdAt", "foodItemId", "id", "translatedText", "updatedAt") SELECT "categoryId", "createdAt", "foodItemId", "id", "translatedText", "updatedAt" FROM "Translation";
DROP TABLE "Translation";
ALTER TABLE "new_Translation" RENAME TO "Translation";
CREATE INDEX "Translation_languageId_idx" ON "Translation"("languageId");
CREATE UNIQUE INDEX "Translation_languageId_categoryId_key" ON "Translation"("languageId", "categoryId");
CREATE UNIQUE INDEX "Translation_languageId_foodItemId_key" ON "Translation"("languageId", "foodItemId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");
