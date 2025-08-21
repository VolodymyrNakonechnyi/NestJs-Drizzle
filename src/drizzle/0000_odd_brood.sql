-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "harvests" (
	"id" serial PRIMARY KEY NOT NULL,
	"quantity_kg" numeric(10, 2) NOT NULL,
	"cost_per_kg" numeric(10, 2),
	"harvester_id" integer NOT NULL,
	"harvest_date" date DEFAULT CURRENT_DATE NOT NULL,
	"additional_payment" numeric(10, 2) DEFAULT '0',
	"is_purchased" boolean DEFAULT false NOT NULL,
	"batch_id" integer
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"nickname" varchar(100),
	"phone_number" varchar(20),
	"registration_date" date DEFAULT CURRENT_DATE NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"average_price_per_kg" numeric(10, 2),
	"harvest_date" date,
	"received_date" date,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"vehicle_id" integer,
	"quantity_kg" numeric(10, 2) NOT NULL,
	"price_per_kg" numeric(10, 2) NOT NULL,
	"delivery_cost" numeric(10, 2) DEFAULT '0',
	"sale_date" date DEFAULT CURRENT_DATE NOT NULL,
	"status" varchar(50) DEFAULT 'processing'
);
--> statement-breakpoint
CREATE TABLE "receivers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"license_plate" varchar(50) NOT NULL,
	"model" varchar(100),
	"capacity_kg" numeric(10, 2),
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "vehicles_license_plate_key" UNIQUE("license_plate")
);
--> statement-breakpoint
CREATE TABLE "receiver_quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"receiver_id" integer NOT NULL,
	"quoted_price_per_kg" numeric(10, 2) NOT NULL,
	"quote_date" date DEFAULT CURRENT_DATE NOT NULL,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_harvester_id_fkey" FOREIGN KEY ("harvester_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvests" ADD CONSTRAINT "fk_harvests_batch" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."receivers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receiver_quotes" ADD CONSTRAINT "receiver_quotes_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."receivers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_harvests_batch_id" ON "harvests" USING btree ("batch_id" int4_ops);--> statement-breakpoint
CREATE VIEW "public"."harvest_summary" AS (SELECT harvest_date, count(*) AS total_harvesters, sum(quantity_kg) AS total_quantity_kg, sum(quantity_kg * cost_per_kg) AS total_base_cost, sum(additional_payment) AS total_additional_payments, sum(quantity_kg * cost_per_kg + additional_payment) AS total_cost_with_payments FROM harvests h GROUP BY harvest_date);--> statement-breakpoint
CREATE VIEW "public"."harvester_details" AS (SELECT p.full_name, p.nickname, h.quantity_kg, h.cost_per_kg, h.quantity_kg * h.cost_per_kg AS base_amount, h.additional_payment, h.quantity_kg * h.cost_per_kg + h.additional_payment AS total_amount, h.harvest_date FROM harvests h JOIN people p ON h.harvester_id = p.id ORDER BY h.harvest_date DESC, h.id);--> statement-breakpoint
CREATE VIEW "public"."batch_profitability" AS (SELECT b.id AS batch_id, b.harvest_date, b.received_date, hs.total_quantity_kg, hs.total_cost_with_payments AS total_harvest_cost, COALESCE(s.actual_selling_price, 0::numeric) AS actual_selling_price, COALESCE(s.actual_revenue, 0::numeric) AS actual_revenue, COALESCE(s.actual_revenue - hs.total_cost_with_payments, 0::numeric) AS actual_profit FROM batches b JOIN harvest_summary hs ON b.harvest_date = hs.harvest_date LEFT JOIN ( SELECT sales.batch_id, sum(sales.price_per_kg * sales.quantity_kg) / sum(sales.quantity_kg) AS actual_selling_price, sum(sales.price_per_kg * sales.quantity_kg) AS actual_revenue FROM sales WHERE sales.status::text = 'completed'::text GROUP BY sales.batch_id) s ON b.id = s.batch_id);--> statement-breakpoint
CREATE VIEW "public"."actual_sales" AS (SELECT s.sale_date, r.name AS receiver_name, s.quantity_kg, s.price_per_kg, s.quantity_kg * s.price_per_kg AS total_amount, s.status FROM sales s JOIN receivers r ON s.receiver_id = r.id ORDER BY s.sale_date DESC);
*/