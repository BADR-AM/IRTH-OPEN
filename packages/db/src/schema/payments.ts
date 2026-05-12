import { pgTable, uuid, varchar, text, timestamp, integer, decimal } from 'drizzle-orm/pg-core'

export const paymentIntents = pgTable('payment_intents', {
  id:             uuid('id').primaryKey().defaultRandom(),
  orgId:          uuid('org_id').notNull(),
  orderId:        uuid('order_id').notNull(),
  provider:       varchar({length: 50}).notNull(),
  providerRef:    varchar('provider_ref', {length: 200}),
  clientSecret:   varchar('client_secret', {length: 500}),
  amount:         decimal({precision: 12, scale: 2}).notNull(),
  currency:       varchar({length: 10}).default('EGP'),
  status:         varchar({length: 50}).default('pending'),
  createdAt:      timestamp('created_at').defaultNow(),
  updatedAt:      timestamp('updated_at').defaultNow(),
})

export const transactions = pgTable('transactions', {
  id:             uuid('id').primaryKey().defaultRandom(),
  orgId:          uuid('org_id').notNull(),
  orderId:        uuid('order_id'),
  paymentIntentId: uuid('payment_intent_id'),
  provider:       varchar({length: 50}).notNull(),
  providerTxnId:  varchar('provider_txn_id', {length: 200}),
  type:           varchar({length: 50}).notNull(),
  amount:         decimal({precision: 12, scale: 2}).notNull(),
  fee:            decimal({precision: 10, scale: 2}).default('0'),
  netAmount:      decimal('net_amount', {precision: 12, scale: 2}),
  status:         varchar({length: 50}).notNull(),
  rawResponse:    text('raw_response'),
  createdAt:      timestamp('created_at').defaultNow(),
})

export const codReconciliation = pgTable('cod_reconciliation', {
  id:             uuid('id').primaryKey().defaultRandom(),
  orgId:          uuid('org_id').notNull(),
  orderId:        uuid('order_id').notNull(),
  expectedAmount: decimal('expected_amount', {precision: 12, scale: 2}).notNull(),
  collectedAmount: decimal('collected_amount', {precision: 12, scale: 2}),
  status:         varchar({length: 50}).default('pending'),
  collectedAt:    timestamp('collected_at'),
  notes:          text(),
  createdAt:      timestamp('created_at').defaultNow(),
})
