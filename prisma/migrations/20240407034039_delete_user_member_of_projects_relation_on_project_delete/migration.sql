-- DropForeignKey
ALTER TABLE "UserMemberOfProjects" DROP CONSTRAINT "UserMemberOfProjects_project_id_fkey";

-- AddForeignKey
ALTER TABLE "UserMemberOfProjects" ADD CONSTRAINT "UserMemberOfProjects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
