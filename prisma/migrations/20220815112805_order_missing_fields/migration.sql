/*
  Warnings:

  - Added the required column `apartment` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cbExpirationDate` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cbLastFourNumbers` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_method` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "apartment" TEXT NOT NULL,
ADD COLUMN     "cbExpirationDate" TEXT NOT NULL,
ADD COLUMN     "cbLastFourNumbers" TEXT NOT NULL,
ADD COLUMN     "shipping_method" TEXT NOT NULL,
ALTER COLUMN "company" DROP NOT NULL;
