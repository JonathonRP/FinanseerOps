ALTER TABLE "buxfer_account" RENAME TO "buxfer_accounts";--> statement-breakpoint
ALTER TABLE "family" RENAME TO "families";--> statement-breakpoint
ALTER TABLE "authjs"."sessions" DROP CONSTRAINT "sessiontoken_unique";--> statement-breakpoint
ALTER TABLE "authjs"."accounts" DROP CONSTRAINT "provider_unique";--> statement-breakpoint
ALTER TABLE "authjs"."verification_tokens" DROP CONSTRAINT "token_identifier_unique";--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "public_notifications_created_by_fkey";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "public_notifications_recipient_id_fkey";
--> statement-breakpoint
ALTER TABLE "authjs"."sessions" DROP CONSTRAINT "sessions_userId_fkey";
--> statement-breakpoint
ALTER TABLE "authjs"."accounts" DROP CONSTRAINT "accounts_userId_fkey";
--> statement-breakpoint
ALTER TABLE "buxfer_accounts" DROP CONSTRAINT "public_buxfer_account_family_id_fkey";
--> statement-breakpoint
ALTER TABLE "buxfer_accounts" DROP CONSTRAINT "public_buxfer_account_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "families" DROP CONSTRAINT "public_family_account_id_fkey";
--> statement-breakpoint
ALTER TABLE "families" DROP CONSTRAINT "public_family_leader_id_fkey";
--> statement-breakpoint
ALTER TABLE "authjs"."users" ALTER COLUMN "emailVerified" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "authjs"."sessions" ALTER COLUMN "expires" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "authjs"."accounts" ALTER COLUMN "expires_at" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "authjs"."verification_tokens" ALTER COLUMN "expires" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "authjs"."accounts" ADD CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId");--> statement-breakpoint
ALTER TABLE "authjs"."verification_tokens" ADD CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authjs"."sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authjs"."accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "buxfer_accounts" ADD CONSTRAINT "buxfer_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "buxfer_accounts" ADD CONSTRAINT "buxfer_accounts_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "families" ADD CONSTRAINT "families_leader_id_users_id_fk" FOREIGN KEY ("leader_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "families" ADD CONSTRAINT "families_account_id_buxfer_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "buxfer_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "authjs"."sessions" DROP COLUMN IF EXISTS "sessionToken";--> statement-breakpoint
ALTER TABLE "authjs"."accounts" DROP COLUMN IF EXISTS "token_type";--> statement-breakpoint
ALTER TABLE "authjs"."accounts" DROP COLUMN IF EXISTS "oauth_token_secret";--> statement-breakpoint
ALTER TABLE "authjs"."accounts" DROP COLUMN IF EXISTS "oauth_token";--> statement-breakpoint
ALTER TABLE "authjs"."users" SET SCHEMA public;
