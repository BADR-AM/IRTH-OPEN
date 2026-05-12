import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../env.d'
import { db, orders, expenses, cashFlowSnapshots, vatReports } from '@irth/db'
import { eq, and, gte, lte } from 'drizzle-orm'

export const financeRouter = new Hono<{Bindings: Env}>()

const expenseSchema = z.object({
  orgId: z.string().uuid(),
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().max(500).optional(),
  vendor: z.string().max(200).optional(),
  expenseDate: z.string().optional(),
  payMethod: z.string().optional(),
  notes: z.string().optional(),
})

financeRouter.get('/cash-flow', async (c) => {
  const orgId = c.req.query('orgId')
  if (!orgId) return c.json({ data: null, error: 'orgId is required' }, 400)

  const allOrders = await db.select().from(orders).where(eq(orders.orgId, orgId))
  const allExpenses = await db.select().from(expenses).where(eq(expenses.orgId, orgId))

  const paidRevenue = allOrders
    .filter(o => o.payStatus === 'paid')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0)

  const pendingCOD = allOrders
    .filter(o => o.payMethod === 'cod' && o.status !== 'delivered' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0)

  const confirmedRevenue = allOrders
    .filter(o => o.payMethod !== 'cod' && o.payStatus === 'pending' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0)

  const paidExpenses = allExpenses
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const pendingExpenses = allExpenses
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const cashOnHand = paidRevenue - paidExpenses
  const inTransit = pendingCOD
  const owed = pendingExpenses

  return c.json({
    data: {
      cashOnHand,
      inTransit,
      owed,
      netCashFlow: cashOnHand + inTransit - owed,
      paidRevenue,
      pendingCOD,
      confirmedRevenue,
      paidExpenses,
      pendingExpenses,
      totalOrders: allOrders.length,
      deliveredOrders: allOrders.filter(o => o.status === 'delivered').length,
    },
    error: null,
  })
})

financeRouter.post('/expenses', async (c) => {
  const body = await c.req.json()
  const parsed = expenseSchema.safeParse(body)
  if (!parsed.success) return c.json({ data: null, error: parsed.error.message }, 400)

  const [expense] = await db.insert(expenses).values({
    ...parsed.data,
    amount: parsed.data.amount.toString(),
    expenseDate: parsed.data.expenseDate ?? new Date().toISOString().split('T')[0],
  }).returning()

  return c.json({ data: expense, error: null }, 201)
})

financeRouter.get('/expenses', async (c) => {
  const orgId = c.req.query('orgId')
  if (!orgId) return c.json({ data: null, error: 'orgId is required' }, 400)

  const list = await db.select().from(expenses).where(eq(expenses.orgId, orgId))
  return c.json({ data: list, error: null })
})
