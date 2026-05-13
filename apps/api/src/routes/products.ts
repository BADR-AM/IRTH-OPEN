import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../env.d'
import { db, products } from '@irth/db'
import { eq } from 'drizzle-orm'

export const productsRouter = new Hono<{Bindings: Env}>()

const createProductSchema = z.object({
  orgId: z.string().uuid(),
  brand: z.enum(['sidr', 'bereket']),
  nameAr: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional(),
  descAr: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

const updateProductSchema = z.object({
  nameAr: z.string().min(1).max(200).optional(),
  nameEn: z.string().max(200).optional(),
  descAr: z.string().optional(),
  brand: z.enum(['sidr', 'bereket']).optional(),
  categoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

productsRouter.get('/', async (c) => {
  const orgId = c.req.query('orgId')
  if (!orgId) return c.json({ data: null, error: 'orgId is required' }, 400)

  const list = await db.select().from(products).where(eq(products.orgId, orgId))
  return c.json({ data: list, error: null })
})

productsRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const product = await db.select().from(products).where(eq(products.id, id)).limit(1)
  if (!product.length) return c.json({ data: null, error: 'Product not found' }, 404)
  return c.json({ data: product[0], error: null })
})

productsRouter.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createProductSchema.safeParse(body)
  if (!parsed.success) return c.json({ data: null, error: parsed.error.message }, 400)

  const [product] = await db.insert(products).values(parsed.data).returning()
  return c.json({ data: product, error: null }, 201)
})

productsRouter.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const parsed = updateProductSchema.safeParse(body)
  if (!parsed.success) return c.json({ data: null, error: parsed.error.message }, 400)
  const [updated] = await db.update(products).set(parsed.data).where(eq(products.id, id)).returning()
  if (!updated) return c.json({ data: null, error: 'Product not found' }, 404)
  return c.json({ data: updated, error: null })
})

productsRouter.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const [deleted] = await db.delete(products).where(eq(products.id, id)).returning()
  if (!deleted) return c.json({ data: null, error: 'Product not found' }, 404)
  return c.json({ data: deleted, error: null })
})
