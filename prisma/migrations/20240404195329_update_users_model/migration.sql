/*
  Warnings:

  - A unique constraint covering the columns `[username,email]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Users_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_email_key" ON "Users"("username", "email");
