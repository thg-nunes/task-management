-- CreateTable
CREATE TABLE "Projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "observations" TEXT,
    "started" BOOLEAN,
    "delivery_date" TIMESTAMP(3),
    "status" TEXT,
    "category" TEXT,
    "author_id" TEXT NOT NULL,

    CONSTRAINT "Projects_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
