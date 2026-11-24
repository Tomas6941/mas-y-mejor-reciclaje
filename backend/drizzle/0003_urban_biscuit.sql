CREATE TYPE "report_category" AS ENUM ('container_status', 'suggestion');--> statement-breakpoint
ALTER TYPE "report_type" ADD VALUE 'move_point';--> statement-breakpoint
ALTER TYPE "report_type" ADD VALUE 'add_point';--> statement-breakpoint
ALTER TYPE "report_type" ADD VALUE 'remove_point';
