-- AlterTable
ALTER TABLE "otp_verifications" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "signupData" JSONB;
