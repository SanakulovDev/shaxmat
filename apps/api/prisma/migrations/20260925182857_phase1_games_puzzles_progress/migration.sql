-- CreateEnum
CREATE TYPE "RatingCategory" AS ENUM ('puzzle', 'bullet', 'blitz', 'rapid', 'classical');

-- CreateTable
CREATE TABLE "Rating" (
    "userId" UUID NOT NULL,
    "category" "RatingCategory" NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "rd" DOUBLE PRECISION NOT NULL,
    "volatility" DOUBLE PRECISION NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("userId","category")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" UUID NOT NULL,
    "whiteId" UUID,
    "blackId" UUID,
    "botLevel" INTEGER,
    "result" TEXT NOT NULL,
    "termination" TEXT NOT NULL,
    "pgn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Puzzle" (
    "id" TEXT NOT NULL,
    "fen" TEXT NOT NULL,
    "moves" TEXT[],
    "rating" INTEGER NOT NULL,
    "ratingDeviation" INTEGER NOT NULL,
    "popularity" INTEGER NOT NULL,
    "plays" INTEGER NOT NULL,
    "themes" TEXT[],

    CONSTRAINT "Puzzle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuzzleAttempt" (
    "userId" UUID NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "solved" BOOLEAN NOT NULL,
    "ratingBefore" DOUBLE PRECISION NOT NULL,
    "ratingAfter" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PuzzleAttempt_pkey" PRIMARY KEY ("userId","puzzleId")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "userId" UUID NOT NULL,
    "lessonSlug" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("userId","lessonSlug")
);

-- CreateIndex
CREATE INDEX "Game_whiteId_createdAt_idx" ON "Game"("whiteId", "createdAt");

-- CreateIndex
CREATE INDEX "Game_blackId_createdAt_idx" ON "Game"("blackId", "createdAt");

-- CreateIndex
CREATE INDEX "Puzzle_rating_idx" ON "Puzzle"("rating");

-- CreateIndex
CREATE INDEX "Puzzle_themes_idx" ON "Puzzle" USING GIN ("themes");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleAttempt" ADD CONSTRAINT "PuzzleAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleAttempt" ADD CONSTRAINT "PuzzleAttempt_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
