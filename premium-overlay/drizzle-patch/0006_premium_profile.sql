ALTER TABLE "user_profile" ADD COLUMN IF NOT EXISTS "job_title" text;
ALTER TABLE "user_profile" ADD COLUMN IF NOT EXISTS "company" text;
ALTER TABLE "user_profile" ADD COLUMN IF NOT EXISTS "social" jsonb;
