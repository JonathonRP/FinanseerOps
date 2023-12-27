-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `accounts` (
	`userId` varchar(191) NOT NULL,
	`type` varchar(191) NOT NULL,
	`provider` varchar(191) NOT NULL,
	`providerAccountId` varchar(191) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` datetime(3),
	`token_type` varchar(191),
	`scope` varchar(191),
	`id_token` text,
	`session_state` varchar(191),
	CONSTRAINT `Account_provider_providerAccountId_key` UNIQUE(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `family` (
	`id` char(36) NOT NULL,
	`name` varchar(255),
	`provider` varchar(255),
	`providerAccountId` varchar(255),
	`leaderId` char(36),
	CONSTRAINT `family_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sessionToken` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`expires` datetime(3) NOT NULL,
	CONSTRAINT `Session_sessionToken_key` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191),
	`email` varchar(191) NOT NULL,
	`emailVerified` datetime(3),
	`image` varchar(191),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `User_email_key` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verificationTokens` (
	`identifier` varchar(191) NOT NULL,
	`token` varchar(191) NOT NULL,
	`expires` datetime(3) NOT NULL,
	CONSTRAINT `verificationTokens_token` PRIMARY KEY(`token`),
	CONSTRAINT `VerificationToken_token_key` UNIQUE(`token`),
	CONSTRAINT `VerificationToken_identifier_token_key` UNIQUE(`identifier`,`token`)
);
--> statement-breakpoint
CREATE INDEX `Account_userId_idx` ON `accounts` (`userId`);--> statement-breakpoint
CREATE INDEX `Session_userId_idx` ON `sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `User_id_idx` ON `users` (`id`);--> statement-breakpoint
CREATE INDEX `User_email_idx` ON `users` (`email`);
*/