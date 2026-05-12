import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core'

export const roles = pgTable('roles', {
  id:        uuid().primaryKey().defaultRandom(),
  orgId:     uuid('org_id').notNull(),
  name:      varchar({length: 100}).notNull(),
  slug:      varchar({length: 100}).notNull(),
  isSystem:  boolean('is_system').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const permissions = pgTable('permissions', {
  id:       uuid().primaryKey().defaultRandom(),
  orgId:    uuid('org_id').notNull(),
  resource: varchar({length: 100}).notNull(),
  action:   varchar({length: 50}).notNull(),
  scope:    jsonb(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const rolePermissions = pgTable('role_permissions', {
  roleId:       uuid('role_id').references(() => roles.id),
  permissionId: uuid('permission_id').references(() => permissions.id),
})

export const userRoles = pgTable('user_roles', {
  userId: uuid('user_id').notNull(),
  roleId: uuid('role_id').references(() => roles.id),
  orgId:  uuid('org_id').notNull(),
})
