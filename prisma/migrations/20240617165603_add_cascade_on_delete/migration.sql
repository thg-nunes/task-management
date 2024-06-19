-- DropForeignKey
ALTER TABLE "Avatar" DROP CONSTRAINT "Avatar_user_id_fkey";

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
