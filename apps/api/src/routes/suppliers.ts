import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../env.d'
import { db, suppliers, purchaseOrders, poItems } from '@irth/db'
import { eq } from 'drizzle-orm'
import { generateOrderNumber } from '@irth/utils'

export const suppliersRouter = new Hono<{Bindings: Env}>()

const createSupplierSchema = z.object({
  orgId: z.string().uuid(),
  name: z.string().min(1).max(200),
  contactName: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  taxId: z.string().max(100).optional(),
  brand: z.string().max(50).optional(),
  paymentTerms: z.string().max(200).optional(),
  notes: z.string().optional(),
})

suppliersRouter.get('/', async (c) => {
  const orgId = c.req.query('orgId')
  if (!orgId) return c.json({ data: null, error: 'orgId is required' }, 400)
  const list = await db.select().from(suppliers).where(eq(suppliers.orgId, orgId))
  return c.json({ data: list, error: null })
})

suppliersRouter.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createSupplierSchema.safeParse(body)
  if (!parsed.success) return c.json({ data: null, error: parsed.error.message }, 400)
  const [supplier] = await db.insert(suppliers).values(parsed.data).returning()
  return c.json({ data: supplier, error: null }, 201)
})

suppliersRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1)
  if (!supplier) return c.json({ data: null, error: 'Supplier not found' }, 404)
  return c.json({ data: supplier, error: null })
})

const createPOSchema = z.object({
  orgId: z.string().uuid(),
  supplierId: z.string().uuid(),
  expectedDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    variantId: z.string().uuid().optional(),
    productName: z.string().min(1).max(200),
    qty: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
})

suppliersRouter.post('/purchase-orders', async (c) => {
  const body = await c.req.json()
  const parsed = createPOSchema.safeParse(body)
  if (!parsed.success) return c.json({ data: null, error: parsed.error.message }, 400)

  const { orgId, supplierId, items, ...poData } = parsed.data
  const lastPO = await db.select()
    .from(purchaseOrders)
    .where(eq(purchaseOrders.orgId, orgId))
    .orderBy(purchaseOrders.createdAt)
    .limit(1)

  const seq = lastPO.length ? parseInt(lastPO[0].poNumber.split('-')[1]) + 1 : 1
  const poNumber = `PO-${String(seq).padStart(4, '0')}`

  let totalAmount = 0
  const poItemsData = items.map(item => {
    const total = item.qty * item.unitPrice
    totalAmount += total
    return {
      orgId,
      poId: '',
      variantId: item.variantId,
      productName: item.productName,
      qty: item.qty,
      unitPrice: item.unitPrice.toString(),
      totalPrice: total.toString(),
    }
  })

  const [po] = await db.insert(purchaseOrders).values({
    orgId, supplierId, poNumber,
    totalAmount: totalAmount.toString(),
    status: 'draft',
    expectedDate: poData.expectedDate,
    notes: poData.notes,
  }).returning()

  for (const item of poItemsData) item.poId = po.id
  await db.insert(poItems).values(poItemsData)

  return c.json({ data: { ...po, items: poItemsData }, error: null }, 201)
})

suppliersRouter.get('/purchase-orders', async (c) => {
  const orgId = c.req.query('orgId')
  if (!orgId) return c.json({ data: null, error: 'orgId is required' }, 400)

  const list = await db.select().from(purchaseOrders).where(eq(purchaseOrders.orgId, orgId))
  return c.json({ data: list, error: null })
})
