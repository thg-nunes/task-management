-- DropForeignKey
ALTER TABLE "Projects" DROP CONSTRAINT "Projects_author_id_fkey";

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
