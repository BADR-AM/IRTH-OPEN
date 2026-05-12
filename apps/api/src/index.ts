import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import type { Env } from './env.d'
import { productsRouter } from './routes/products'
import { ordersRouter } from './routes/orders'
import { paymentsRouter } from './routes/payments'
import { inventoryRouter } from './routes/inventory'
import { shippingRouter } from './routes/shipping'
import { webhooksRouter } from './routes/webhooks'
import { trpcRouter } from './trpc/router'
import { auth } from './lib/auth'

const app = new Hono<{Bindings: Env}>()

app.use('*', logger())
app.use('*', secureHeaders())
app.use('*', cors({
  origin: ['https://admin.irthwellness.co', 'https://irthwellness.co'],
  credentials: true,
}))

app.get('/health', (c) => c.json({ status: 'ok', service: 'irth-api', ts: Date.now() }))

app.route('/api/v1/products', productsRouter)
app.route('/api/v1/orders', ordersRouter)
app.route('/api/v1/payments', paymentsRouter)
app.route('/api/v1/inventory', inventoryRouter)
app.route('/api/v1/shipping', shippingRouter)
app.route('/api/v1/webhooks', webhooksRouter)
app.route('/trpc', trpcRouter)

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

export default app
