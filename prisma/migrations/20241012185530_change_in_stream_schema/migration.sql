/*
  Warnings:

  - Added the required column `extracteId` to the `Stream` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "extracteId" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
