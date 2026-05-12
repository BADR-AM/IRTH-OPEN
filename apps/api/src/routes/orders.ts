import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../env.d'
import { db, orders, orderItems, products, productVariants } from '@irth/db'
import { eq } from 'drizzle-orm'
import { generateOrderNumber, calcVat } from '@irth/utils'

export const ordersRouter = new Hono<{Bindings: Env}>()

const createOrderSchema = z.object({
  orgId: z.string().uuid(),
  brand: z.enum(['sidr', 'bereket']),
  customerId: z.string().uuid().optional(),
  customerName: z.string().max(200).optional(),
  customerPhone: z.string().max(20),
  governorate: z.string().max(100),
  addressLine: z.string().optional(),
  payMethod: z.enum(['paymob', 'fawry', 'cod', 'stripe']),
  items: z.array(z.object({
    variantId: z.string().uuid(),
    qty: z.number().int().positive(),
  })).min(1),
  notes: z.string().optional(),
})

ordersRouter.get('/', async (c) => {
  const orgId = c.req.query('orgId')
  if (!orgId) return c.json({ data: null, error: 'orgId is required' }, 400)

  const list = await db.select().from(orders).where(eq(orders.orgId, orgId))
  return c.json({ data: list, error: null })
})

ordersRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const order = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
  if (!order.length) return c.json({ data: null, error: 'Order not found' }, 404)
  return c.json({ data: order[0], error: null })
})

ordersRouter.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) return c.json({ data: null, error: parsed.error.message }, 400)

  const { items, ...orderData } = parsed.data
  const lastOrder = await db.select({ orderNumber: orders.orderNumber }).from(orders)
    .where(eq(orders.brand, orderData.brand))
    .orderBy(orders.createdAt)
    .limit(1)

  const seq = lastOrder.length ? parseInt(lastOrder[0].orderNumber.split('-')[2]) + 1 : 1
  const orderNumber = generateOrderNumber(orderData.brand, seq)

  let subtotal = 0
  const orderItemsData = []

  for (const item of items) {
    const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, item.variantId)).limit(1)
    if (!variant) return c.json({ data: null, error: `Variant ${item.variantId} not found` }, 404)

    const [product] = await db.select().from(products).where(eq(products.id, variant.productId)).limit(1)
    const lineTotal = Number(variant.price) * item.qty
    subtotal += lineTotal

    orderItemsData.push({
      orgId: orderData.orgId,
      orderId: '', // will update after insert
      variantId: item.variantId,
      productName: product?.nameAr ?? '',
      qty: item.qty,
      unitPrice: variant.price.toString(),
      totalPrice: lineTotal.toString(),
    })
  }

  const vatAmount = calcVat(subtotal)
  const totalAmount = subtotal + vatAmount

  const [order] = await db.insert(orders).values({
    ...orderData,
    orderNumber,
    subtotal: subtotal.toString(),
    vatAmount: vatAmount.toString(),
    totalAmount: totalAmount.toString(),
    status: 'pending',
    payStatus: 'pending',
  }).returning()

  for (const item of orderItemsData) {
    item.orderId = order.id
  }
  await db.insert(orderItems).values(orderItemsData)

  return c.json({ data: { ...order, items: orderItemsData }, error: null }, 201)
})

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
}

ordersRouter.patch('/:id/status', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { status } = body
  if (!status) return c.json({ data: null, error: 'status is required' }, 400)

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
  if (!order) return c.json({ data: null, error: 'Order not found' }, 404)

  const allowed = VALID_TRANSITIONS[order.status]
  if (!allowed?.includes(status)) {
    return c.json({ data: null, error: `Cannot transition from ${order.status} to ${status}` }, 400)
  }

  const [updated] = await db.update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning()

  await db.insert(auditLog).values({
    orgId: order.orgId,
    action: `order.status.${status}`,
    table: 'orders',
    recordId: order.id,
    before: { status: order.status },
    after: { status },
  })

  return c.json({ data: updated, error: null })
})

ordersRouter.get('/stats/dashboard', async (c) => {
  const orgId = c.req.query('orgId')
  if (!orgId) return c.json({ data: null, error: 'orgId is required' }, 400)

  const allOrders = await db.select().from(orders).where(eq(orders.orgId, orgId))
  const totalOrders = allOrders.length
  const pendingOrders = allOrders.filter(o => o.status === 'pending').length
  const paidOrders = allOrders.filter(o => o.payStatus === 'paid').length
  const shippedOrders = allOrders.filter(o => o.status === 'shipped').length
  const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
  const paidRevenue = allOrders.filter(o => o.payStatus === 'paid').reduce((sum, o) => sum + Number(o.totalAmount), 0)

  return c.json({
    data: { totalOrders, pendingOrders, paidOrders, shippedOrders, totalRevenue, paidRevenue },
    error: null,
  })
})
