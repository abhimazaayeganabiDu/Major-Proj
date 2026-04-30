-- CreateEnum
CREATE TYPE "userRole" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "password" TEXT NOT NULL,
    "role" "userRole" NOT NULL DEFAULT 'USER',
    "isVarified" BOOLEAN NOT NULL DEFAULT false,
    "emailvarificationToken" TEXT NOT NULL,
    "emailVarificationTokenExpiry" TIMESTAMP(3) NOT NULL,
    "forgotPasswordToken" TEXT NOT NULL,
    "forgotPasswordTokenExpiry" TIMESTAMP(3) NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "refreshTokenExpiry" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
