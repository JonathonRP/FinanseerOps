CREATE SCHEMA "api-keys";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api-keys"."buckets" (
	"name" text PRIMARY KEY NOT NULL,
	"tokens" integer,
	"updated" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api-keys"."keys" (
	"hash" text PRIMARY KEY NOT NULL,
	"user" uuid,
	"name" text,
	"description" text,
	"expires" timestamp,
	"permissions" text[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waitingList" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"email" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api-keys"."keys" ADD CONSTRAINT "keys_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
