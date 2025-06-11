ALTER TABLE "t3-trial1-postgres_item" DROP CONSTRAINT "t3-trial1-postgres_item_list_id_t3-trial1-postgres_list_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t3-trial1-postgres_item" ADD CONSTRAINT "t3-trial1-postgres_item_list_id_t3-trial1-postgres_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."t3-trial1-postgres_list"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
