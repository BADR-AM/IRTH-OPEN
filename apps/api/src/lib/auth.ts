import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@irth/db'
import { organization, rbac, twoFactor } from 'better-auth/plugins'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  emailAndPassword: { enabled: true },
  plugins: [
    organization(),
    twoFactor(),
    rbac({
      roles: {
        super_admin: { permissions: ['*'] },
        operations:  { permissions: ['orders:*', 'inventory:*', 'suppliers:*', 'shipping:*'] },
        marketing:   { permissions: ['marketing:*', 'products:read', 'orders:read'] },
        warehouse:   { permissions: ['orders:read', 'orders:pack', 'inventory:read'] },
        supplier:    { permissions: ['supplier_portal:read', 'files:upload'] },
        cs:          { permissions: ['orders:read', 'customers:*', 'tickets:*'] },
      }
    }),
  ],
})
