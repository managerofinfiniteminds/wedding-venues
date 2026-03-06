-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "photoAuditedAt" TIMESTAMP(3),
ADD COLUMN     "photoSource" TEXT,
ADD COLUMN     "pipelineProcessedAt" TIMESTAMP(3);
