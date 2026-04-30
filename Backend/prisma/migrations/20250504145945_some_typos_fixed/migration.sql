/*
  Warnings:

  - You are about to drop the column `tastCase` on the `TestCaseResult` table. All the data in the column will be lost.
  - Added the required column `testCase` to the `TestCaseResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TestCaseResult" DROP COLUMN "tastCase",
ADD COLUMN     "testCase" INTEGER NOT NULL;
