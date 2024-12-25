/*
  Warnings:

  - A unique constraint covering the columns `[languageId,originalText]` on the table `Translation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Translation" ADD COLUMN "originalText" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FoodItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "itemLimit" INTEGER,
    "limitType" TEXT NOT NULL DEFAULT 'perHousehold',
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "mustGo" BOOLEAN NOT NULL DEFAULT false,
    "lowSupply" BOOLEAN NOT NULL DEFAULT false,
    "kosher" BOOLEAN NOT NULL DEFAULT false,
    "halal" BOOLEAN NOT NULL DEFAULT false,
    "vegetarian" BOOLEAN NOT NULL DEFAULT false,
    "vegan" BOOLEAN NOT NULL DEFAULT false,
    "glutenFree" BOOLEAN NOT NULL DEFAULT false,
    "organic" BOOLEAN NOT NULL DEFAULT false,
    "readyToEat" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FoodItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FoodItem" ("categoryId", "createdAt", "glutenFree", "halal", "id", "imageUrl", "inStock", "itemLimit", "kosher", "limitType", "lowSupply", "mustGo", "name", "organic", "readyToEat", "thumbnailUrl", "updatedAt", "vegan", "vegetarian") SELECT "categoryId", "createdAt", "glutenFree", "halal", "id", "imageUrl", "inStock", "itemLimit", "kosher", coalesce("limitType", 'perHousehold') AS "limitType", "lowSupply", "mustGo", "name", "organic", "readyToEat", "thumbnailUrl", "updatedAt", "vegan", "vegetarian" FROM "FoodItem";
DROP TABLE "FoodItem";
ALTER TABLE "new_FoodItem" RENAME TO "FoodItem";
CREATE INDEX "FoodItem_categoryId_idx" ON "FoodItem"("categoryId");
CREATE UNIQUE INDEX "FoodItem_name_key" ON "FoodItem"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Translation_languageId_originalText_key" ON "Translation"("languageId", "originalText");
