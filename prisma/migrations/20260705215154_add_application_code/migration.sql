-- Add applicationCode with a temporary default so existing rows get a value,
-- then drop the default so new rows must supply one explicitly.

-- AlterTable
ALTER TABLE "AdmissionApplication"
  ADD COLUMN "applicationCode" TEXT NOT NULL
    DEFAULT upper(substring(md5(random()::text) from 1 for 8));

-- Remove the default — the application layer will supply it from now on
ALTER TABLE "AdmissionApplication"
  ALTER COLUMN "applicationCode" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionApplication_applicationCode_key"
  ON "AdmissionApplication"("applicationCode");
