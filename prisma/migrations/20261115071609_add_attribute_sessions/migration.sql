/*
  Warnings:

  - The primary key for the `sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `sessions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token_hash]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token_hash` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_pkey",
DROP COLUMN "id",
ADD COLUMN     "session_id" SERIAL NOT NULL,
ADD COLUMN     "token_hash" TEXT NOT NULL,
ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");
