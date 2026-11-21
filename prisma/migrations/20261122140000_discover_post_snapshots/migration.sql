-- AlterTable
ALTER TABLE "schedules" ADD COLUMN "published_from_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "schedules_published_from_id_key" ON "schedules"("published_from_id");

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_published_from_id_fkey" FOREIGN KEY ("published_from_id") REFERENCES "schedules"("schedule_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Turn every public plan into a private plan plus a frozen Discover post
INSERT INTO "schedules" ("schedule_name", "created_at", "updated_at", "description", "total_day", "cover_url", "categories", "is_public", "owner_id", "published_from_id")
SELECT "schedule_name", "created_at", "updated_at", "description", "total_day", "cover_url", "categories", true, "owner_id", "schedule_id"
FROM "schedules"
WHERE "is_public" = true AND "published_from_id" IS NULL;

INSERT INTO "schedule_items" ("sequence_no", "visit_time", "day_no", "schedule_id", "location_id")
SELECT i."sequence_no", i."visit_time", i."day_no", p."schedule_id", i."location_id"
FROM "schedule_items" i
JOIN "schedules" p ON p."published_from_id" = i."schedule_id";

UPDATE "schedules" SET "is_public" = false WHERE "published_from_id" IS NULL AND "is_public" = true;
