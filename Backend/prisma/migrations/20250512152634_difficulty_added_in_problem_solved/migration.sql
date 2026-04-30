/*
  Warnings:

  - Added the required column `difficulty` to the `ProblemSolved` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProblemSolved" ADD COLUMN     "difficulty" TEXT NOT NULL;
