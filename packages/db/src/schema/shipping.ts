import { pgTable, uuid, varchar, text, timestamp, integer, decimal, jsonb, boolean } from 'drizzle-orm/pg-core'

export const shipments = pgTable('shipments', {
  id:             uuid('id').primaryKey().defaultRandom(),
  orgId:          uuid('org_id').notNull(),
  orderId:        uuid('order_id').notNull(),
  provider:       varchar({length: 50}).notNull(),
  trackingNumber: varchar('tracking_number', {length: 100}),
  awbUrl:         varchar('awb_url', {length: 500}),
  status:         varchar({length: 50}).default('pending'),
  governorate:    varchar({length: 100}),
  addressLine:    text('address_line'),
  customerPhone:  varchar('customer_phone', {length: 20}),
  customerName:   varchar('customer_name', {length: 200}),
  codAmount:      decimal('cod_amount', {precision: 12, scale: 2}),
  shippingCost:   decimal('shipping_cost', {precision: 8, scale: 2}),
  notes:          text(),
  createdAt:      timestamp('created_at').defaultNow(),
  updatedAt:      timestamp('updated_at').defaultNow(),
})

export const trackingEvents = pgTable('tracking_events', {
  id:             uuid('id').primaryKey().defaultRandom(),
  orgId:          uuid('org_id').notNull(),
  shipmentId:     uuid('shipment_id').notNull(),
  status:         varchar({length: 100}).notNull(),
  description:    text(),
  location:       varchar({length: 200}),
  timestamp:      timestamp().defaultNow(),
  raw:            jsonb(),
})

export const shippingZones = pgTable('shipping_zones', {
  id:             uuid('id').primaryKey().defaultRandom(),
  orgId:          uuid('org_id').notNull(),
  name:           varchar({length: 100}).notNull(),
  governorates:   jsonb().notNull(),
  baseCost:       decimal('base_cost', {precision: 8, scale: 2}).notNull(),
  freeThreshold:  decimal('free_threshold', {precision: 8, scale: 2}),
  isActive:       boolean('is_active').default(true),
  createdAt:      timestamp('created_at').defaultNow(),
})
