import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../env.d'
import { db, orders } from '@irth/db'
import { eq } from 'drizzle-orm'

export const paymentsRouter = new Hono<{Bindings: Env}>()

const createIntentionSchema = z.object({
  orderId: z.string().uuid(),
  billingEmail: z.string().email().optional(),
  billingPhone: z.string().optional(),
})

async function getPaymobToken(apiKey: string): Promise<string> {
  const res = await fetch('https://accept.paymob.com/api/auth/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  })
  const data = await res.json() as { token?: string }
  return data.token!
}

async function registerPaymobOrder(token: string, orderId: string, amount: number, items: { name: string; qty: number; price: string }[]) {
  const res = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      auth_token: token,
      delivery_needed: false,
      amount_cents: Math.round(amount * 100),
      currency: 'EGP',
      merchant_order_id: orderId,
      items,
    }),
  })
  return res.json() as Promise<{ id: number }>
}

paymentsRouter.post('/create-intention', async (c) => {
  const body = await c.req.json()
  const parsed = createIntentionSchema.safeParse(body)
  if (!parsed.success) return c.json({ data: null, error: parsed.error.message }, 400)

  const [order] = await db.select().from(orders).where(eq(orders.id, parsed.data.orderId)).limit(1)
  if (!order) return c.json({ data: null, error: 'Order not found' }, 404)
  if (order.payStatus === 'paid') return c.json({ data: null, error: 'Order already paid' }, 400)

  const token = await getPaymobToken(c.env.PAYMOB_API_KEY)

  const pmOrder = await registerPaymobOrder(token, order.orderNumber, Number(order.totalAmount), [
    { name: `Order ${order.orderNumber}`, qty: 1, price: String(Math.round(Number(order.totalAmount) * 100)) },
  ])

  const intentionRes = await fetch('https://accept.paymob.com/v1/intention/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: Number(order.totalAmount),
      currency: 'EGP',
      merchant_order_id: pmOrder.id,
      payment_methods: [Number(c.env.PAYMOB_INTEGRATION_ID)],
      items: [],
      billing_data: {
        apartment: 'N/A',
        email: parsed.data.billingEmail ?? 'customer@irthwellness.co',
        floor: 'N/A',
        first_name: order.customerName ?? 'Customer',
        street: order.addressLine ?? 'N/A',
        building: 'N/A',
        phone_number: parsed.data.billingPhone ?? order.customerPhone ?? '01000000000',
        shipping_method: 'PKG',
        postal_code: 'N/A',
        city: order.governorate ?? 'Cairo',
        country: 'EG',
        last_name: '.',
        state: order.governorate ?? 'Cairo',
      },
    }),
  })
  const intention = await intentionRes.json() as { client_secret?: string; id?: number }

  await db.update(orders)
    .set({ payStatus: 'pending' })
    .where(eq(orders.id, order.id))

  return c.json({
    data: {
      clientSecret: intention.client_secret,
      intentionId: intention.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
    },
    error: null,
  }, 201)
})
