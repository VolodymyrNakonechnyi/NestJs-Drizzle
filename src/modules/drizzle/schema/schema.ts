import {
	numeric,
	integer,
	date,
	varchar,
	pgView,
	bigint,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { harvests } from './harvest.schema';
import { people } from './people.schema';
import { batches } from './batches.schema';
import { sales } from './sales.schema';
import { receivers } from './receivers.schema';
import { vehicles } from './vehicles.schema';
import { receiverQuotes } from './receiverQuotes.schema';
import { users } from './users.schema';

export {
	harvests,
	people,
	batches,
	sales,
	receivers,
	vehicles,
	receiverQuotes,
	users,
};

export const harvestSummary = pgView('harvest_summary', {
	harvestDate: date('harvest_date'),
	totalHarvesters: bigint('total_harvesters', { mode: 'number' }),
	totalQuantityKg: numeric('total_quantity_kg'),
	totalBaseCost: numeric('total_base_cost'),
	totalAdditionalPayments: numeric('total_additional_payments'),
	totalCostWithPayments: numeric('total_cost_with_payments'),
}).as(
	sql`SELECT 
		harvest_date, 
		count(*) AS total_harvesters, 
		sum(quantity_kg) AS total_quantity_kg, 
		sum(quantity_kg * cost_per_kg) AS total_base_cost, 
		sum(additional_payment) AS total_additional_payments, 
		sum(quantity_kg * cost_per_kg + additional_payment) AS total_cost_with_payments 
	FROM harvests h 
	GROUP BY harvest_date`,
);

export const harvesterDetails = pgView('harvester_details', {
	fullName: varchar('full_name', { length: 255 }),
	nickname: varchar({ length: 100 }),
	quantityKg: numeric('quantity_kg', { precision: 10, scale: 2 }),
	costPerKg: numeric('cost_per_kg', { precision: 10, scale: 2 }),
	baseAmount: numeric('base_amount'),
	additionalPayment: numeric('additional_payment', {
		precision: 10,
		scale: 2,
	}),
	totalAmount: numeric('total_amount'),
	harvestDate: date('harvest_date'),
}).as(
	sql`SELECT 
		p.full_name, 
		p.nickname, 
		h.quantity_kg, 
		h.cost_per_kg, 
		h.quantity_kg * h.cost_per_kg AS base_amount, 
		h.additional_payment, 
		h.quantity_kg * h.cost_per_kg + h.additional_payment AS total_amount, 
		h.harvest_date 
	FROM harvests h 
	JOIN people p ON h.harvester_id = p.id 
	ORDER BY h.harvest_date DESC, h.id`,
);

export const actualSales = pgView('actual_sales', {
	saleDate: date('sale_date'),
	receiverName: varchar('receiver_name', { length: 255 }),
	quantityKg: numeric('quantity_kg', { precision: 10, scale: 2 }),
	pricePerKg: numeric('price_per_kg', { precision: 10, scale: 2 }),
	totalAmount: numeric('total_amount'),
	status: varchar({ length: 50 }),
}).as(
	sql`SELECT 
		s.sale_date, 
		r.name AS receiver_name, 
		s.quantity_kg, 
		s.price_per_kg, 
		s.quantity_kg * s.price_per_kg AS total_amount, 
		s.status 
	FROM sales s 
	JOIN receivers r ON s.receiver_id = r.id 
	ORDER BY s.sale_date DESC`,
);

export const batchProfitability = pgView('batch_profitability', {
	batchId: integer('batch_id'),
	harvestDate: date('harvest_date'),
	receivedDate: date('received_date'),
	totalQuantityKg: numeric('total_quantity_kg'),
	totalHarvestCost: numeric('total_harvest_cost'),
	actualSellingPrice: numeric('actual_selling_price'),
	actualRevenue: numeric('actual_revenue'),
	actualProfit: numeric('actual_profit'),
}).as(
	sql`SELECT 
		b.id AS batch_id,
		b.harvest_date,
		b.received_date,
		harvest_costs.total_quantity_kg,
		harvest_costs.total_harvest_cost,
		COALESCE(sales_summary.actual_selling_price, 0::numeric) AS actual_selling_price,
		COALESCE(sales_summary.actual_revenue, 0::numeric) AS actual_revenue,
		COALESCE(sales_summary.actual_revenue - harvest_costs.total_harvest_cost, 0::numeric) AS actual_profit
	FROM batches b
	JOIN (
		SELECT 
			h.harvest_date,
			sum(h.quantity_kg) AS total_quantity_kg,
			sum(h.quantity_kg * h.cost_per_kg + h.additional_payment) AS total_harvest_cost
		FROM harvests h
		GROUP BY h.harvest_date
	) harvest_costs ON b.harvest_date = harvest_costs.harvest_date
	LEFT JOIN (
		SELECT 
			s.batch_id,
			sum(s.price_per_kg * s.quantity_kg) / sum(s.quantity_kg) AS actual_selling_price,
			sum(s.price_per_kg * s.quantity_kg) AS actual_revenue
		FROM sales s
		WHERE s.status = 'completed'
		GROUP BY s.batch_id
	) sales_summary ON b.id = sales_summary.batch_id`,
);
