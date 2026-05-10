-- CreateTable
CREATE TABLE "CardItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "setName" TEXT,
    "cardNumber" TEXT,
    "rarity" TEXT,
    "language" TEXT,
    "condition" TEXT,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT '持有中',
    "gradingCompany" TEXT,
    "grade" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DOUBLE PRECISION,
    "purchaseShipping" DOUBLE PRECISION DEFAULT 0,
    "purchasePlatform" TEXT,
    "saleDate" TIMESTAMP(3),
    "salePrice" DOUBLE PRECISION,
    "saleShipping" DOUBLE PRECISION DEFAULT 0,
    "salePlatform" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardItem_pkey" PRIMARY KEY ("id")
);
