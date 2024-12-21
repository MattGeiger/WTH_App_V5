-- CreateTable
CREATE TABLE "_prisma_new_Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "itemLimit" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Copy data
INSERT INTO "_prisma_new_Category" ("id", "name", "createdAt", "updatedAt")
SELECT "id", "name", "createdAt", "updatedAt" FROM "Category";

-- Drop old table and rename new
DROP TABLE "Category";
ALTER TABLE "_prisma_new_Category" RENAME TO "Category";