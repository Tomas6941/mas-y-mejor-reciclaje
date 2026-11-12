ALTER TABLE "reports" DROP CONSTRAINT "reports_point_id_points_id_fk";--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "point_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "comment" TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "category" "report_category" DEFAULT 'container_status' NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "suggested_location" varchar(240);--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "image_data" text;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_point_id_points_id_fk" FOREIGN KEY ("point_id") REFERENCES "public"."points"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_category_type_consistency" CHECK (("category" = 'container_status' and "type" in ('full', 'damaged', 'available') and "point_id" is not null) or ("category" = 'suggestion' and "type" = 'add_point' and "point_id" is null) or ("category" = 'suggestion' and "type" in ('move_point', 'remove_point') and "point_id" is not null));
