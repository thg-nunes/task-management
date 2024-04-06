/*
  Warnings:

  - A unique constraint covering the columns `[author_id,name]` on the table `Projects` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Projects" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Projects_author_id_name_key" ON "Projects"("author_id", "name");
