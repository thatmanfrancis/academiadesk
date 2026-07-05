/*
  Warnings:

  - The `curriculum` column on the `Tenant` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "lga" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "schoolType" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "website" TEXT,
DROP COLUMN "curriculum",
ADD COLUMN     "curriculum" TEXT[];
