-- DropForeignKey
ALTER TABLE "UserMemberOfProjects" DROP CONSTRAINT "UserMemberOfProjects_user_id_fkey";

-- AddForeignKey
ALTER TABLE "UserMemberOfProjects" ADD CONSTRAINT "UserMemberOfProjects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
