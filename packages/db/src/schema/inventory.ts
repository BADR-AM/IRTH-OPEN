import { pgTable, uuid, varchar, text, timestamp, integer, decimal, jsonb } from 'drizzle-orm/pg-core'

const baseColumns = {
  id:        uuid('id').primaryKey().defaultRandom(),
  orgId:     uuid('org_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}

export const stockLevels = pgTable('stock_levels', {
  ...baseColumns,
  variantId:   uuid('variant_id').notNull(),
  warehouse:   varchar({length: 100}).default('main'),
  qty:         integer().notNull().default(0),
  reservedQty: integer('reserved_qty').default(0),
})

export const stockMovements = pgTable('stock_movements', {
  id:          uuid('id').primaryKey().defaultRandom(),
  orgId:       uuid('org_id').notNull(),
  variantId:   uuid('variant_id').notNull(),
  type:        varchar({length: 50}).notNull(),
  qty:         integer().notNull(),
  refType:     varchar('ref_type', {length: 50}),
  refId:       uuid('ref_id'),
  notes:       text(),
  createdBy:   uuid('created_by'),
  createdAt:   timestamp('created_at').defaultNow(),
})

export const batches = pgTable('batches', {
  id:           uuid('id').primaryKey().defaultRandom(),
  orgId:        uuid('org_id').notNull(),
  variantId:    uuid('variant_id').notNull(),
  batchNumber:  varchar('batch_number', {length: 100}).notNull(),
  qty:          integer().notNull(),
  remainingQty: integer('remaining_qty').notNull(),
  expiryDate:   timestamp('expiry_date'),
  receivedDate: timestamp('received_date').defaultNow(),
  costPrice:    decimal('cost_price', {precision: 10, scale: 2}),
  createdAt:    timestamp('created_at').defaultNow(),
})
