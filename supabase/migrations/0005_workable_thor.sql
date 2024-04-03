ALTER TYPE "rates" ADD VALUE 'bi-monthly';--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "finance_check_reminder_notification_rate" TO "email_rate";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "transactions_notification_rate" TO "in-app_rate";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "permitted_bank_accounts" varchar[];