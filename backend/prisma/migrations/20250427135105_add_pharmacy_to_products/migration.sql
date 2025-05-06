/*
  Warnings:

  - Added the required column `pharmacyId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "pharmacyId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Product_pharmacyId_idx" ON "Product"("pharmacyId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
