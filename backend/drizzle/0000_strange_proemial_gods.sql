CREATE TYPE "public"."point_status" AS ENUM('available', 'near-full', 'full', 'damaged');--> statement-breakpoint
CREATE TYPE "public"."point_type" AS ENUM('green_point', 'container');--> statement-breakpoint
CREATE TYPE "public"."report_review_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('full', 'damaged', 'available');--> statement-breakpoint
CREATE TYPE "public"."schedule_icon" AS ENUM('recycle', 'leaf', 'trash');--> statement-breakpoint
CREATE TYPE "public"."auth_token_purpose" AS ENUM('email_verification', 'password_reset');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TABLE "materials" (
	"key" varchar(32) PRIMARY KEY NOT NULL,
	"label" varchar(100) NOT NULL,
	"short_label" varchar(40) NOT NULL,
	"color" varchar(7) NOT NULL,
	"color_dark" varchar(7) NOT NULL,
	"sort_order" integer NOT NULL,
	CONSTRAINT "materials_sort_order_unique" UNIQUE("sort_order")
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"score" smallint NOT NULL,
	"total" smallint NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_attempts_total_range" CHECK ("quiz_attempts"."total" between 1 and 100),
	CONSTRAINT "quiz_attempts_score_range" CHECK ("quiz_attempts"."score" >= 0 and "quiz_attempts"."score" <= "quiz_attempts"."total")
);
--> statement-breakpoint
CREATE TABLE "tracking_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"material_key" varchar(32) NOT NULL,
	"kilograms" numeric(8, 2) NOT NULL,
	"record_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tracking_entries_kilograms_range" CHECK ("tracking_entries"."kilograms" > 0 and "tracking_entries"."kilograms" <= 1000)
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"neighborhood_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "point_materials" (
	"point_id" uuid NOT NULL,
	"material_key" varchar(32) NOT NULL,
	CONSTRAINT "point_materials_point_id_material_key_pk" PRIMARY KEY("point_id","material_key")
);
--> statement-breakpoint
CREATE TABLE "points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" varchar(80) NOT NULL,
	"name" varchar(160) NOT NULL,
	"address" varchar(240) NOT NULL,
	"latitude" numeric(9, 6) NOT NULL,
	"longitude" numeric(9, 6) NOT NULL,
	"type" "point_type" NOT NULL,
	"status" "point_status" DEFAULT 'available' NOT NULL,
	"hours" varchar(160) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "points_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "points_latitude_range" CHECK ("points"."latitude" between -90 and 90),
	CONSTRAINT "points_longitude_range" CHECK ("points"."longitude" between -180 and 180)
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" varchar(80) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" uuid,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"point_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"type" "report_type" NOT NULL,
	"comment" varchar(180) DEFAULT '' NOT NULL,
	"status" "report_review_status" DEFAULT 'pending' NOT NULL,
	"reviewer_id" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection_schedule_days" (
	"schedule_id" uuid NOT NULL,
	"weekday" smallint NOT NULL,
	CONSTRAINT "collection_schedule_days_schedule_id_weekday_pk" PRIMARY KEY("schedule_id","weekday"),
	CONSTRAINT "collection_schedule_days_weekday_range" CHECK ("collection_schedule_days"."weekday" between 0 and 6)
);
--> statement-breakpoint
CREATE TABLE "collection_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"neighborhood_id" uuid NOT NULL,
	"key" varchar(48) NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon" "schedule_icon" NOT NULL,
	"color" varchar(7) NOT NULL,
	"description" varchar(300) NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "neighborhoods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "neighborhoods_slug_unique" UNIQUE("slug"),
	CONSTRAINT "neighborhoods_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "auth_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"purpose" "auth_token_purpose" NOT NULL,
	"token_hash" varchar(128) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(128) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"display_name" varchar(80),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(254) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"email_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_normalized" CHECK ("users"."email" = lower("users"."email"))
);
--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_entries" ADD CONSTRAINT "tracking_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_entries" ADD CONSTRAINT "tracking_entries_material_key_materials_key_fk" FOREIGN KEY ("material_key") REFERENCES "public"."materials"("key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_materials" ADD CONSTRAINT "point_materials_point_id_points_id_fk" FOREIGN KEY ("point_id") REFERENCES "public"."points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_materials" ADD CONSTRAINT "point_materials_material_key_materials_key_fk" FOREIGN KEY ("material_key") REFERENCES "public"."materials"("key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_point_id_points_id_fk" FOREIGN KEY ("point_id") REFERENCES "public"."points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_schedule_days" ADD CONSTRAINT "collection_schedule_days_schedule_id_collection_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."collection_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_schedules" ADD CONSTRAINT "collection_schedules_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quiz_attempts_user_completed_idx" ON "quiz_attempts" USING btree ("user_id","completed_at");--> statement-breakpoint
CREATE INDEX "tracking_entries_user_date_idx" ON "tracking_entries" USING btree ("user_id","record_date");--> statement-breakpoint
CREATE INDEX "points_status_idx" ON "points" USING btree ("status");--> statement-breakpoint
CREATE INDEX "audit_log_entity_created_idx" ON "audit_log" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "reports_status_created_idx" ON "reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "reports_point_created_idx" ON "reports" USING btree ("point_id","created_at");--> statement-breakpoint
CREATE INDEX "reports_author_created_idx" ON "reports" USING btree ("author_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "collection_schedules_key_by_neighborhood_unique" ON "collection_schedules" USING btree ("neighborhood_id","key");--> statement-breakpoint
CREATE INDEX "collection_schedules_neighborhood_idx" ON "collection_schedules" USING btree ("neighborhood_id");--> statement-breakpoint
CREATE INDEX "auth_tokens_user_purpose_idx" ON "auth_tokens" USING btree ("user_id","purpose");--> statement-breakpoint
CREATE INDEX "auth_tokens_expiration_idx" ON "auth_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expiration_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_unique" ON "users" USING btree (lower("email"));