import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../env.d'
import { db, orders, shipments, trackingEvents } from '@irth/db'
import { eq } from 'drizzle-orm'
import { createBostaDelivery } from '../lib/bosta'
import { sendOrderShipped } from '../lib/whatsapp'

export const shippingRouter = new Hono<{Bindings: Env}>()

const createShipmentSchema = z.object({
  orgId: z.string().uuid(),
  orderId: z.string().uuid(),
  provider: z.enum(['bosta', 'mylerz']).default('bosta'),
})

shippingRouter.post('/create', async (c) => {
  const body = await c.req.json()
  const parsed = createShipmentSchema.safeParse(body)
  if (!parsed.success) return c.json({ data: null, error: parsed.error.message }, 400)

  const { orgId, orderId, provider } = parsed.data

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) return c.json({ data: null, error: 'Order not found' }, 404)
  if (order.status !== 'confirmed' && order.status !== 'processing') {
    return c.json({ data: null, error: 'Order must be confirmed/processing to ship' }, 400)
  }

  let trackingNumber = ''
  let awbUrl = ''
  let providerRef = ''

  if (provider === 'bosta') {
    const result = await createBostaDelivery(c.env.BOSTA_API_KEY, c.env.BOSTA_BUSINESS_ID, {
      orderNumber: order.orderNumber,
      customerName: order.customerName || 'Customer',
      customerPhone: order.customerPhone || '01000000000',
      governorate: order.governorate || 'Cairo',
      addressLine: order.addressLine || '',
      codAmount: order.payMethod === 'cod' ? Number(order.totalAmount) : 0,
      notes: order.notes || undefined,
    })
    trackingNumber = result.trackingNumber
    awbUrl = result.awbUrl
    providerRef = result.deliveryId
  } else {
    return c.json({ data: null, error: 'Mylerz not yet implemented' }, 501)
  }

  const [shipment] = await db.insert(shipments).values({
    orgId,
    orderId,
    provider,
    trackingNumber,
    awbUrl,
    status: 'created',
    governorate: order.governorate,
    addressLine: order.addressLine,
    customerPhone: order.customerPhone,
    customerName: order.customerName,
    codAmount: order.payMethod === 'cod' ? order.totalAmount : '0',
  }).returning()

  await db.insert(trackingEvents).values({
    orgId,
    shipmentId: shipment.id,
    status: 'created',
    description: 'تم إنشاء الشحنة',
  })

  await db.update(orders).set({ status: 'shipped', updatedAt: new Date() }).where(eq(orders.id, orderId))

  if (c.env.WHATSAPP_API_KEY && c.env.WHATSAPP_FROM) {
    await sendOrderShipped(
      { apiKey: c.env.WHATSAPP_API_KEY, from: c.env.WHATSAPP_FROM },
      order.customerPhone || '',
      { orderNumber: order.orderNumber, trackingNumber, customerName: order.customerName || '' }
    )
  }

  return c.json({ data: shipment, error: null }, 201)
})

shippingRouter.get('/track/:trackingNumber', async (c) => {
  const trackingNumber = c.req.param('trackingNumber')
  const [shipment] = await db.select().from(shipments).where(eq(shipments.trackingNumber, trackingNumber)).limit(1)
  if (!shipment) return c.json({ data: null, error: 'Shipment not found' }, 404)

  const events = await db.select().from(trackingEvents).where(eq(trackingEvents.shipmentId, shipment.id))
  return c.json({ data: { shipment, events }, error: null })
})

shippingRouter.get('/list', async (c) => {
  const orgId = c.req.query('orgId')
  if (!orgId) return c.json({ data: null, error: 'orgId is required' }, 400)

  const list = await db.select().from(shipments).where(eq(shipments.orgId, orgId))
  return c.json({ data: list, error: null })
})
