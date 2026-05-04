CREATE TABLE "blacklist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hashed_ip" text NOT NULL,
	"type" text DEFAULT 'permanent',
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone,
	CONSTRAINT "blacklist_hashed_ip_unique" UNIQUE("hashed_ip")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"sender_token" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'active',
	"sender" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"center_lat" double precision NOT NULL,
	"center_lng" double precision NOT NULL,
	"center_point" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_blacklist_hashed_ip" ON "blacklist" USING btree ("hashed_ip");--> statement-breakpoint
CREATE INDEX "idx_messages_room_id" ON "messages" USING btree ("room_id","sent_at");--> statement-breakpoint
CREATE INDEX "idx_messages_status" ON "messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_rooms_center_point" ON "rooms" USING btree ("center_point");--> statement-breakpoint
CREATE INDEX "idx_rooms_is_active" ON "rooms" USING btree ("is_active");