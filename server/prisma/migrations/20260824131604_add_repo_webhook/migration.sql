-- CreateTable
CREATE TABLE "Repowebhook" (
    "id" TEXT NOT NULL,
    "repository" TEXT NOT NULL,
    "githubHookId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repowebhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repowebhook_repository_key" ON "Repowebhook"("repository");

-- AddForeignKey
ALTER TABLE "Repowebhook" ADD CONSTRAINT "Repowebhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
