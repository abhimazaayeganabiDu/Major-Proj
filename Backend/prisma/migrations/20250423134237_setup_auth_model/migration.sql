/*
  Warnings:

  - Made the column `image` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "image" SET NOT NULL,
ALTER COLUMN "emailvarificationToken" DROP NOT NULL,
ALTER COLUMN "emailVarificationTokenExpiry" DROP NOT NULL,
ALTER COLUMN "forgotPasswordToken" DROP NOT NULL,
ALTER COLUMN "forgotPasswordTokenExpiry" DROP NOT NULL,
ALTER COLUMN "refreshToken" DROP NOT NULL,
ALTER COLUMN "refreshTokenExpiry" DROP NOT NULL;
