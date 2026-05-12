export * from './schema/core.js'
export * from './schema/inventory.js'
export * from './schema/payments.js'
export * from './schema/shipping.js'
export * from './schema/roles.js'
export * from './schema/suppliers.js'
export * from './schema/notifications.js'
export * from './schema/files.js'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/core.js'

const connectionString = process.env.DATABASE_URL!
if (!connectionString) throw new Error('DATABASE_URL is required')

const client = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
})

export const db = drizzle(client, { schema })
