/*
  Warnings:

  - Added the required column `user_email` to the `Avatar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Avatar" ADD COLUMN     "user_email" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
