ALTER TABLE "authjs"."accounts" DROP CONSTRAINT "accounts_provider_providerAccountId_pk";--> statement-breakpoint
ALTER TABLE "authjs"."verification_tokens" DROP CONSTRAINT "verification_tokens_identifier_token_pk";--> statement-breakpoint
ALTER TABLE "authjs"."accounts" ADD COLUMN "id" uuid DEFAULT uuid_generate_v4() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "leadership_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "membership_id" uuid;--> statement-breakpoint
ALTER TABLE "authjs"."sessions" ADD COLUMN "sessionToken" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_leadership_id_families_id_fk" FOREIGN KEY ("leadership_id") REFERENCES "families"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_membership_id_families_id_fk" FOREIGN KEY ("membership_id") REFERENCES "families"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "authjs"."accounts" ADD CONSTRAINT "provider_unique" UNIQUE("provider","providerAccountId");--> statement-breakpoint
ALTER TABLE "authjs"."sessions" ADD CONSTRAINT "sessiontoken_unique" UNIQUE("sessionToken");--> statement-breakpoint
ALTER TABLE "authjs"."verification_tokens" ADD CONSTRAINT "token_identifier_unique" UNIQUE("identifier","token");