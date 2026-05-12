import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: ['./src/schema/core.ts', './src/schema/inventory.ts', './src/schema/payments.ts', './src/schema/shipping.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
