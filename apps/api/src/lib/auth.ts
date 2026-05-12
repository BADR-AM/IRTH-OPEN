import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@irth/db'
import { organization, twoFactor } from 'better-auth/plugins'

export function createAuth(env: { BETTER_AUTH_SECRET: string; BETTER_AUTH_URL: string }) {
  const config = {
    database: drizzleAdapter(db, { provider: 'pg' }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: { enabled: true },
    plugins: [
      organization(),
      twoFactor(),
    ],
  }
  return betterAuth(config)
}
