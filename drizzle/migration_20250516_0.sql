ALTER TABLE "t3-trial1-postgres_list" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "t3-trial1-postgres_list" DROP COLUMN IF EXISTS "pinned_position";