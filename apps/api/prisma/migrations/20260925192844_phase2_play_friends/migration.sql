-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('active', 'finished', 'aborted');

-- CreateEnum
CREATE TYPE "ChallengeColor" AS ENUM ('white', 'black', 'random');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('open', 'accepted', 'declined', 'cancelled');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('pending', 'accepted');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "blackMs" INTEGER,
ADD COLUMN     "blackRating" INTEGER,
ADD COLUMN     "blackRatingDiff" INTEGER,
ADD COLUMN     "category" "RatingCategory",
ADD COLUMN     "drawOffer" TEXT,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "moves" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "rated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'finished',
ADD COLUMN     "takebackOffer" TEXT,
ADD COLUMN     "timeIncrement" INTEGER,
ADD COLUMN     "timeInitial" INTEGER,
ADD COLUMN     "turnStartedAt" TIMESTAMP(3),
ADD COLUMN     "whiteMs" INTEGER,
ADD COLUMN     "whiteRating" INTEGER,
ADD COLUMN     "whiteRatingDiff" INTEGER,
ALTER COLUMN "termination" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Challenge" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "creatorId" UUID NOT NULL,
    "destId" UUID,
    "color" "ChallengeColor" NOT NULL,
    "rated" BOOLEAN NOT NULL,
    "timeInitial" INTEGER NOT NULL,
    "timeIncrement" INTEGER NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'open',
    "gameId" UUID,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "requesterId" UUID NOT NULL,
    "addresseeId" UUID NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("requesterId","addresseeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_code_key" ON "Challenge"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_gameId_key" ON "Challenge"("gameId");

-- CreateIndex
CREATE INDEX "Challenge_creatorId_status_idx" ON "Challenge"("creatorId", "status");

-- CreateIndex
CREATE INDEX "Challenge_destId_status_idx" ON "Challenge"("destId", "status");

-- CreateIndex
CREATE INDEX "Friendship_addresseeId_status_idx" ON "Friendship"("addresseeId", "status");

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "Game"("status");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_whiteId_fkey" FOREIGN KEY ("whiteId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_blackId_fkey" FOREIGN KEY ("blackId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_destId_fkey" FOREIGN KEY ("destId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
