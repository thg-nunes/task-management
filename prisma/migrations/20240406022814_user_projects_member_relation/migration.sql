-- CreateTable
CREATE TABLE "UserMemberOfProjects" (
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "UserMemberOfProjects_pkey" PRIMARY KEY ("user_id","project_id")
);

-- AddForeignKey
ALTER TABLE "UserMemberOfProjects" ADD CONSTRAINT "UserMemberOfProjects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMemberOfProjects" ADD CONSTRAINT "UserMemberOfProjects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
