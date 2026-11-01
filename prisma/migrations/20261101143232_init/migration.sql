-- CreateEnum
CREATE TYPE "category" AS ENUM ('nature', 'culture', 'adventure', 'marine', 'wellness', 'culinary', 'religious', 'agritourism', 'community', 'sports', 'entertainment');

-- CreateEnum
CREATE TYPE "role" AS ENUM ('EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL DEFAULT 'user',
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password_hash" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "schedule_id" SERIAL NOT NULL,
    "schedule_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "total_day" INTEGER NOT NULL,
    "cover_url" TEXT,
    "category" "category" NOT NULL,
    "owner_id" INTEGER NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("schedule_id")
);

-- CreateTable
CREATE TABLE "schedule_items" (
    "item_id" SERIAL NOT NULL,
    "sequence_no" INTEGER NOT NULL,
    "visit_time" TIME(0) NOT NULL,
    "day_no" INTEGER NOT NULL,
    "schedule_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,

    CONSTRAINT "schedule_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "locations" (
    "location_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city_id" INTEGER NOT NULL,
    "image_url" TEXT,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "cities" (
    "city_id" SERIAL NOT NULL,
    "city_name" TEXT NOT NULL,
    "province_id" INTEGER NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("city_id")
);

-- CreateTable
CREATE TABLE "provinces" (
    "province_id" SERIAL NOT NULL,
    "province_name" TEXT NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("province_id")
);

-- CreateTable
CREATE TABLE "schedule_members" (
    "user_id" INTEGER NOT NULL,
    "schedule_id" INTEGER NOT NULL,
    "role" "role" NOT NULL DEFAULT 'VIEWER',

    CONSTRAINT "schedule_members_pkey" PRIMARY KEY ("user_id","schedule_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "schedules_owner_id_idx" ON "schedules"("owner_id");

-- CreateIndex
CREATE INDEX "schedule_items_location_id_idx" ON "schedule_items"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_items_schedule_id_day_no_sequence_no_key" ON "schedule_items"("schedule_id", "day_no", "sequence_no");

-- CreateIndex
CREATE INDEX "locations_city_id_idx" ON "locations"("city_id");

-- CreateIndex
CREATE INDEX "cities_province_id_idx" ON "cities"("province_id");

-- CreateIndex
CREATE INDEX "schedule_members_schedule_id_idx" ON "schedule_members"("schedule_id");

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("province_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_members" ADD CONSTRAINT "schedule_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_members" ADD CONSTRAINT "schedule_members_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE CASCADE ON UPDATE CASCADE;
