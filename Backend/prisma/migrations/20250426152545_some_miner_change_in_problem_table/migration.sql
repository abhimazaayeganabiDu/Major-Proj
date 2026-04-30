/*
  Warnings:

  - You are about to drop the column `testcase` on the `Problem` table. All the data in the column will be lost.
  - Added the required column `testcases` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "testcase",
ADD COLUMN     "testcases" JSONB NOT NULL;
