/*
  Warnings:

  - You are about to drop the column `user_email` on the `Avatar` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `Avatar` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Avatar" DROP CONSTRAINT "Avatar_user_email_fkey";

-- AlterTable
ALTER TABLE "Avatar" DROP COLUMN "user_email",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
