/*
  Warnings:

  - A unique constraint covering the columns `[project_id,title,description]` on the table `Tasks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `created_by_id` to the `Tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Tasks_project_id_assigned_to_id_key";

-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "created_by_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tasks_project_id_title_description_key" ON "Tasks"("project_id", "title", "description");
