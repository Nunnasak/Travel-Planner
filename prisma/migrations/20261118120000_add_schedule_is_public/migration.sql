-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "schedules_is_public_idx" ON "schedules"("is_public");
