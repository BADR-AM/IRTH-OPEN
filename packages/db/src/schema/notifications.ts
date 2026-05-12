import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core'

export const notificationTemplates = pgTable('notification_templates', {
  id:        uuid().primaryKey().defaultRandom(),
  orgId:     uuid('org_id').notNull(),
  name:      varchar({length: 100}).notNull(),
  channel:   varchar({length: 50}).notNull(),
  event:     varchar({length: 100}).notNull(),
  subject:   varchar({length: 200}),
  body:      text().notNull(),
  variables: jsonb(),
  isActive:  boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export const notificationLog = pgTable('notification_log', {
  id:         uuid().primaryKey().defaultRandom(),
  orgId:      uuid('org_id').notNull(),
  channel:    varchar({length: 50}).notNull(),
  recipient:  varchar({length: 200}).notNull(),
  event:      varchar({length: 100}).notNull(),
  subject:    varchar({length: 200}),
  body:       text(),
  status:     varchar({length: 50}).default('pending'),
  error:      text(),
  sentAt:     timestamp('sent_at'),
  createdAt:  timestamp('created_at').defaultNow(),
})
