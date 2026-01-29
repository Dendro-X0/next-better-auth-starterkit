CREATE TABLE "user_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"bio" text,
	"location" text,
	"website" text,
	"notifications" jsonb,
	"privacy" jsonb
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email_verified" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "onboarding_complete" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "onboarding_complete" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "two_factor_enabled" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "two_factor_enabled" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "two_factor_secret";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "bio";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "website";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "notifications";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "privacy";
