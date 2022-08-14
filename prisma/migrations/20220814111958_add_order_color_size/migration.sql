/*
  Warnings:

  - Added the required column `order` to the `Color` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Size` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Color" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Size" ADD COLUMN     "order" INTEGER NOT NULL;
