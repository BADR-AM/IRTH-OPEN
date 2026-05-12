import { pgTable, uuid, varchar, text, timestamp, integer, decimal, jsonb, boolean, date } from 'drizzle-orm/pg-core'

const baseColumns = {
  id:        uuid('id').primaryKey().defaultRandom(),
  orgId:     uuid('org_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}

export const suppliers = pgTable('suppliers', {
  ...baseColumns,
  name:        varchar({length: 200}).notNull(),
  contactName: varchar('contact_name', {length: 200}),
  phone:       varchar({length: 20}),
  email:       varchar({length: 255}),
  address:     text(),
  taxId:       varchar('tax_id', {length: 100}),
  brand:       varchar({length: 50}),
  paymentTerms: varchar('payment_terms', {length: 200}),
  isActive:    boolean('is_active').default(true),
  notes:       text(),
})

export const purchaseOrders = pgTable('purchase_orders', {
  ...baseColumns,
  poNumber:    varchar('po_number', {length: 30}).unique().notNull(),
  supplierId:  uuid('supplier_id').notNull(),
  status:      varchar({length: 50}).default('draft'),
  totalAmount: decimal('total_amount', {precision: 12, scale: 2}).notNull(),
  expectedDate: date('expected_date'),
  notes:       text(),
})

export const poItems = pgTable('po_items', {
  ...baseColumns,
  poId:         uuid('po_id').notNull(),
  variantId:    uuid('variant_id'),
  productName:  varchar('product_name', {length: 200}).notNull(),
  qty:          integer().notNull(),
  receivedQty:  integer('received_qty').default(0),
  unitPrice:    decimal('unit_price', {precision: 10, scale: 2}).notNull(),
  totalPrice:   decimal('total_price', {precision: 12, scale: 2}).notNull(),
})

export const qualityChecks = pgTable('quality_checks', {
  ...baseColumns,
  poId:        uuid('po_id').notNull(),
  checkedBy:   uuid('checked_by'),
  status:      varchar({length: 50}).default('pending'),
  notes:       text(),
  result:      jsonb(),
  checkedAt:   timestamp('checked_at'),
})
