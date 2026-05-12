import { pgTable, uuid, varchar, text, timestamp, integer, decimal, jsonb, boolean, date } from 'drizzle-orm/pg-core'

const base = {
  id:        uuid('id').primaryKey().defaultRandom(),
  orgId:     uuid('org_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}

export const expenses = pgTable('expenses', {
  ...base,
  category:    varchar({length: 100}).notNull(),
  amount:      decimal({precision: 12, scale: 2}).notNull(),
  description: varchar({length: 500}),
  vendor:      varchar({length: 200}),
  expenseDate: date('expense_date'),
  payMethod:   varchar('pay_method', {length: 50}),
  status:      varchar({length: 50}).default('pending'),
  receiptUrl:  varchar('receipt_url', {length: 500}),
  approvedBy:  uuid('approved_by'),
  notes:       text(),
})

export const cashFlowSnapshots = pgTable('cash_flow_snapshots', {
  ...base,
  snapshotDate:    date('snapshot_date').notNull(),
  totalRevenue:    decimal('total_revenue', {precision: 14, scale: 2}).default('0'),
  paidRevenue:     decimal('paid_revenue', {precision: 14, scale: 2}).default('0'),
  pendingCOD:      decimal('pending_cod', {precision: 14, scale: 2}).default('0'),
  totalExpenses:   decimal('total_expenses', {precision: 14, scale: 2}).default('0'),
  pendingExpenses: decimal('pending_expenses', {precision: 14, scale: 2}).default('0'),
  netCash:         decimal('net_cash', {precision: 14, scale: 2}).default('0'),
  details:         jsonb(),
})

export const vatReports = pgTable('vat_reports', {
  ...base,
  reportDate:     date('report_date').notNull(),
  period:         varchar({length: 50}).notNull(),
  totalSales:     decimal('total_sales', {precision: 14, scale: 2}).default('0'),
  totalVat:       decimal('total_vat', {precision: 14, scale: 2}).default('0'),
  totalExpenses:  decimal('total_expenses', {precision: 14, scale: 2}).default('0'),
  vatOnExpenses:  decimal('vat_on_expenses', {precision: 14, scale: 2}).default('0'),
  netVatDue:      decimal('net_vat_due', {precision: 14, scale: 2}).default('0'),
  status:         varchar({length: 50}).default('draft'),
  submittedAt:    timestamp('submitted_at'),
})
