-- CreateEnum
CREATE TYPE "link_access" AS ENUM ('restricted', 'viewer', 'editor');

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN "share_token" TEXT,
ADD COLUMN "link_access" "link_access" NOT NULL DEFAULT 'restricted';

-- CreateIndex
CREATE UNIQUE INDEX "schedules_share_token_key" ON "schedules"("share_token");
