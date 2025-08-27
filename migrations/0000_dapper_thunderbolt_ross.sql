CREATE TABLE "ai_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"insight" text NOT NULL,
	"confidence" numeric(3, 2),
	"is_actionable" boolean DEFAULT false NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coping_tools_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"tool_type" text NOT NULL,
	"duration" integer,
	"completed" boolean DEFAULT false NOT NULL,
	"effectiveness" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crisis_chat_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" text NOT NULL,
	"counselor_id" text,
	"status" text DEFAULT 'waiting' NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	CONSTRAINT "crisis_chat_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "emergency_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"relationship" text NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "emergency_incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"location" jsonb,
	"severity" text NOT NULL,
	"description" text,
	"contacts_notified" jsonb[],
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mood_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"mood" text NOT NULL,
	"mood_score" integer NOT NULL,
	"note" text,
	"ai_analysis" jsonb,
	"risk_level" text,
	"location" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"emergency_countdown" integer DEFAULT 180 NOT NULL,
	"auto_detection_enabled" boolean DEFAULT true NOT NULL,
	"voice_commands_enabled" boolean DEFAULT false NOT NULL,
	"location_sharing_enabled" boolean DEFAULT true NOT NULL,
	"notification_preferences" jsonb DEFAULT '{"sms": true, "email": true, "push": true}' NOT NULL,
	"privacy_level" text DEFAULT 'standard' NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"username" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image" varchar,
	"password_hash" varchar,
	"auth_provider" varchar DEFAULT 'local',
	"email_verified" boolean DEFAULT false,
	"email_verification_token" varchar,
	"welcome_email_sent" boolean DEFAULT false,
	"subscription_plan" varchar DEFAULT 'free',
	"subscription_status" varchar DEFAULT 'active',
	"pro_trial_started" boolean DEFAULT false,
	"pro_trial_start_date" timestamp,
	"pro_trial_end_date" timestamp,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coping_tools_usage" ADD CONSTRAINT "coping_tools_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crisis_chat_sessions" ADD CONSTRAINT "crisis_chat_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_incidents" ADD CONSTRAINT "emergency_incidents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mood_entries" ADD CONSTRAINT "mood_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");