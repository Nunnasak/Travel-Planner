-- AlterTable
ALTER TABLE "schedules" ADD COLUMN "categories" "category"[] NOT NULL DEFAULT ARRAY[]::"category"[];

UPDATE "schedules" SET "categories" = ARRAY["category"];

ALTER TABLE "schedules" DROP COLUMN "category";
