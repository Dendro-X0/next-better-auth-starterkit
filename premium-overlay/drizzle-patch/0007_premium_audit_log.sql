CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"event" text NOT NULL,
	"actor_user_id" text,
	"target_user_id" text,
	"ip_address" text,
	"user_agent" text,
	"metadata" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "audit_log_event_created_at_idx" ON "audit_log" USING btree ("event","created_at");
--> statement-breakpoint
CREATE INDEX "audit_log_actor_created_at_idx" ON "audit_log" USING btree ("actor_user_id","created_at");
--> statement-breakpoint
CREATE INDEX "audit_log_target_created_at_idx" ON "audit_log" USING btree ("target_user_id","created_at");
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_target_user_id_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
