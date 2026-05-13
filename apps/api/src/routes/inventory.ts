import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../env.d'
import { db, stockLevels, stockMovements, productVariants } from '@irth/db'
import { eq, and } from 'drizzle-orm'

export const inventoryRouter = new Hono<{Bindings: Env}>()

const adjustSchema = z.object({
  orgId: z.string().uuid(),
  variantId: z.string().uuid(),
  qty: z.number().int(),
  type: z.enum(['add', 'remove', 'reserve', 'unreserve']),
  notes: z.string().optional(),
  refType: z.string().optional(),
  refId: z.string().uuid().optional(),
})

inventoryRouter.get('/levels', async (c) => {
  const orgId = c.req.query('orgId')
  const variantId = c.req.query('variantId')
  if (!orgId) return c.json({ data: null, error: 'orgId is required' }, 400)

  const levels = await db.select().from(stockLevels).where(
    and(eq(stockLevels.orgId, orgId), variantId ? eq(stockLevels.variantId, variantId) : undefined)
  )
  return c.json({ data: levels, error: null })
})

inventoryRouter.get('/movements', async (c) => {
  const orgId = c.req.query('orgId')
  const variantId = c.req.query('variantId')
  if (!orgId) return c.json({ data: null, error: 'orgId is required' }, 400)

  const movements = await db.select().from(stockMovements).where(
    and(eq(stockMovements.orgId, orgId), variantId ? eq(stockMovements.variantId, variantId) : undefined)
  )
  return c.json({ data: movements, error: null })
})

inventoryRouter.post('/adjust', async (c) => {
  const body = await c.req.json()
  const parsed = adjustSchema.safeParse(body)
  if (!parsed.success) return c.json({ data: null, error: parsed.error.message }, 400)

  const { orgId, variantId, qty, type, notes, refType, refId } = parsed.data

  const [existing] = await db.select().from(stockLevels)
    .where(and(eq(stockLevels.orgId, orgId), eq(stockLevels.variantId, variantId)))
    .limit(1)

  let newQty = existing?.qty ?? 0
  let newReserved = existing?.reservedQty ?? 0

  switch (type) {
    case 'add': newQty += qty; break
    case 'remove': newQty = Math.max(0, newQty - qty); break
    case 'reserve': newReserved += qty; break
    case 'unreserve': newReserved = Math.max(0, newReserved - qty); break
  }

  if (existing) {
    await db.update(stockLevels)
      .set({ qty: newQty, reservedQty: newReserved })
      .where(eq(stockLevels.id, existing.id))
  } else {
    await db.insert(stockLevels).values({
      orgId, variantId, qty: newQty, reservedQty: newReserved,
    })
  }

  const [movement] = await db.insert(stockMovements).values({
    orgId, variantId, type, qty: type === 'remove' || type === 'reserve' ? -qty : qty,
    notes, refType, refId,
  }).returning()

  return c.json({ data: movement, error: null }, 201)
})
