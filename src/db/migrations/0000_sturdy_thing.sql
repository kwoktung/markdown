CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	`deleted_at` integer
);
--> statement-breakpoint
CREATE INDEX `documents_title_idx` ON `documents` (`title`);--> statement-breakpoint
CREATE INDEX `documents_userId_idx` ON `documents` (`user_id`);--> statement-breakpoint
CREATE INDEX `documents_createdAt_idx` ON `documents` (`created_at`);