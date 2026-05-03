/*
  Warnings:

  - You are about to drop the column `userId` on the `audit_logs` table. All the data in the column will be lost.
  - Added the required column `actorId` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actorRole` to the `audit_logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `audit_logs` DROP FOREIGN KEY `audit_logs_userId_fkey`;

-- AlterTable
ALTER TABLE `audit_logs` DROP COLUMN `userId`,
    ADD COLUMN `actorId` BIGINT NOT NULL,
    ADD COLUMN `actorRole` ENUM('ADMIN', 'USER') NOT NULL;

-- CreateIndex
CREATE INDEX `audit_logs_actorId_idx` ON `audit_logs`(`actorId`);

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
