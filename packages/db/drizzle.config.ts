import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: ['./src/schema/core.ts', './src/schema/inventory.ts', './src/schema/payments.ts', './src/schema/shipping.ts', './src/schema/roles.ts', './src/schema/suppliers.ts', './src/schema/notifications.ts', './src/schema/files.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
