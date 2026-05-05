/*
  Warnings:

  - You are about to alter the column `action` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Enum(EnumId(5))`.

*/
-- AlterTable
ALTER TABLE `audit_logs` MODIFY `action` ENUM('TICKET_CREATED', 'TICKET_UPDATED', 'STATUS_CHANGED', 'TICKET_DELETED', 'TICKET_RESTORED', 'COMMENT_ADDED') NOT NULL;
