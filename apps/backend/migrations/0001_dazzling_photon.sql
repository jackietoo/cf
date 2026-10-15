CREATE TABLE `sequences` (
	`type` text PRIMARY KEY NOT NULL,
	`current_value` integer DEFAULT 1 NOT NULL,
	`step` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
