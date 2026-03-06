-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "auditFlags" JSONB,
ADD COLUMN     "auditScore" INTEGER,
ADD COLUMN     "auditStatus" TEXT,
ADD COLUMN     "lastAuditedAt" TIMESTAMP(3);
