-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "gpsCoordinates" TEXT,
ADD COLUMN     "openingHours" TEXT;

-- AlterTable
ALTER TABLE "Pharmacy" ADD COLUMN     "currencyCode" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "openingHours" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "contraindications" TEXT,
ADD COLUMN     "sideEffects" TEXT,
ADD COLUMN     "storageInstructions" TEXT,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "preferredLanguage" TEXT,
ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "theme" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
