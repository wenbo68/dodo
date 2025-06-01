ALTER TABLE "t3-trial1-postgres_list" ADD COLUMN "pinned_position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "t3-trial1-postgres_list" DROP COLUMN IF EXISTS "is_pinned";