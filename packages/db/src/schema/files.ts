import { pgTable, uuid, varchar, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core'

export const files = pgTable('files', {
  id:          uuid().primaryKey().defaultRandom(),
  orgId:       uuid('org_id').notNull(),
  name:        varchar({length: 500}).notNull(),
  mimeType:    varchar('mime_type', {length: 100}),
  sizeBytes:   integer('size_bytes'),
  storageKey:  varchar('storage_key', {length: 500}).notNull(),
  provider:    varchar({length: 50}).default('r2'),
  uploadedBy:  uuid('uploaded_by'),
  refType:     varchar('ref_type', {length: 50}),
  refId:       uuid('ref_id'),
  isPublic:    boolean('is_public').default(false),
  createdAt:   timestamp('created_at').defaultNow(),
})

export const sharedLinks = pgTable('shared_links', {
  id:         uuid().primaryKey().defaultRandom(),
  fileId:     uuid('file_id').notNull(),
  token:      varchar({length: 200}).unique().notNull(),
  expiresAt:  timestamp('expires_at'),
  maxDownloads: integer('max_downloads'),
  downloads:  integer().default(0),
  createdAt:  timestamp('created_at').defaultNow(),
})
