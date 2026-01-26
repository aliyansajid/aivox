-- AlterTable
ALTER TABLE "assistants" ADD COLUMN     "voice_provider" TEXT NOT NULL DEFAULT '11labs',
ADD COLUMN     "end_message" TEXT;
