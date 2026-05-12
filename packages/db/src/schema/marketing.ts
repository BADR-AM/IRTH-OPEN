import { pgTable, uuid, varchar, text, timestamp, integer, decimal, boolean, date } from 'drizzle-orm/pg-core'

const base = {
  id:        uuid('id').primaryKey().defaultRandom(),
  orgId:     uuid('org_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}

export const campaigns = pgTable('campaigns', {
  ...base,
  name:        varchar({length: 200}).notNull(),
  brand:       varchar({length: 50}),
  type:        varchar({length: 50}),
  budget:      decimal({precision: 10, scale: 2}),
  spent:       decimal({precision: 10, scale: 2}).default('0'),
  startDate:   date('start_date'),
  endDate:     date('end_date'),
  status:      varchar({length: 50}).default('draft'),
  notes:       text(),
})

export const influencers = pgTable('influencers', {
  ...base,
  name:        varchar({length: 200}).notNull(),
  platform:    varchar({length: 100}),
  handle:      varchar({length: 200}),
  phone:       varchar({length: 20}),
  brand:       varchar({length: 50}),
  rate:        decimal({precision: 10, scale: 2}),
  campaignId:  uuid('campaign_id'),
  status:      varchar({length: 50}).default('contacted'),
  notes:       text(),
})

export const coupons = pgTable('coupons', {
  ...base,
  code:        varchar({length: 50}).unique().notNull(),
  brand:       varchar({length: 50}),
  type:        varchar({length: 50}).default('percentage'),
  value:       decimal({precision: 10, scale: 2}).notNull(),
  minOrder:    decimal('min_order', {precision: 10, scale: 2}),
  maxUses:     integer('max_uses'),
  usedCount:   integer('used_count').default(0),
  expiresAt:   timestamp('expires_at'),
  isActive:    boolean('is_active').default(true),
})

export const waitlist = pgTable('waitlist', {
  id:         uuid('id').primaryKey().defaultRandom(),
  orgId:      uuid('org_id').notNull(),
  email:      varchar({length: 255}).notNull(),
  name:       varchar({length: 200}),
  company:    varchar({length: 200}),
  phone:      varchar({length: 20}),
  status:     varchar({length: 50}).default('waiting'),
  notes:      text(),
  createdAt:  timestamp('created_at').defaultNow(),
})
