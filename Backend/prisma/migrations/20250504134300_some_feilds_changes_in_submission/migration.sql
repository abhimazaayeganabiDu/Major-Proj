/*
  Warnings:

  - You are about to drop the column `sourceCode` on the `Submission` table. All the data in the column will be lost.
  - Added the required column `source_code` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "sourceCode",
ADD COLUMN     "source_code" JSONB NOT NULL;
