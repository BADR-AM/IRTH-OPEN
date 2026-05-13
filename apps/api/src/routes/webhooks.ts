import { Hono } from 'hono'
import type { Env } from '../env.d'
import { db, orders, orderItems, auditLog } from '@irth/db'
import { eq } from 'drizzle-orm'

export const webhooksRouter = new Hono<{Bindings: Env}>()

webhooksRouter.post('/paymob', async (c) => {
  const hmac = c.req.query('hmac')
  const body = await c.req.json()

  const hmacKeys = [
    'amount_cents','created_at','currency','error_occured',
    'has_parent_transaction','id','integration_id','is_3d_secure',
    'is_auth','is_capture','is_refunded','is_standalone_payment',
    'is_voided','order','owner','pending',
    'source_data.pan','source_data.sub_type','source_data.type','success',
  ]
  const str = hmacKeys.map(k => {
    const keys = k.split('.')
    return keys.reduce((o: Record<string, unknown>, key: string) => o?.[key] as Record<string, unknown>, body.obj as Record<string, unknown>) ?? ''
  }).join('')

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(c.env.PAYMOB_HMAC_SECRET),
    { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(str))
  const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')

  if (computed !== hmac) return c.json({ data: null, error: 'Invalid HMAC' }, 401)

  if (body.obj?.success) {
    await db.update(orders)
      .set({ payStatus: 'paid', status: 'confirmed' })
      .where(eq(orders.orderNumber, body.obj.order?.merchant_order_id))
  }

  if (body.obj?.success === false) {
    await db.update(orders)
      .set({ payStatus: 'failed' })
      .where(eq(orders.orderNumber, body.obj.order?.merchant_order_id))
  }

  return c.json({ data: { received: true }, error: null })
})

webhooksRouter.post('/fawry', async (c) => {
  const body = await c.req.json()
  const merchantRef = body.merchantRefNumber
  const signature = body.signature

  const str = `${merchantRef}${body.amountCents}${body.paymentAmount}${c.env.FAWRY_SECURITY_KEY}${body.paymentMethod}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(c.env.FAWRY_SECURITY_KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(str))
  const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')

  if (computed !== signature) return c.json({ data: null, error: 'Invalid signature' }, 401)

  const status = body.paymentStatus
  if (status === 'PAID') {
    await db.update(orders)
      .set({ payStatus: 'paid', status: 'confirmed' })
      .where(eq(orders.orderNumber, merchantRef))
  }

  return c.json({ data: { received: true }, error: null })
})

webhooksRouter.post('/bosta', async (c) => {
  const signature = c.req.header('x-bosta-signature')
  const body = await c.req.text()
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(c.env.BOSTA_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  )
  const valid = await crypto.subtle.verify(
    'HMAC', key,
    new Uint8Array(signature?.split('').map(c => c.charCodeAt(0)) ?? []),
    encoder.encode(body)
  )
  if (!valid) return c.json({ data: null, error: 'Invalid signature' }, 401)

  const data = JSON.parse(body)
  if (data.status) {
    await db.update(orders)
      .set({ status: data.status.toLowerCase() })
      .where(eq(orders.orderNumber, data.reference))
  }

  return c.json({ data: { received: true }, error: null })
})
