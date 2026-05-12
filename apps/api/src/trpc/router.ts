import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { db, orders, products, auditLog } from '@irth/db'
import { eq } from 'drizzle-orm'

const t = initTRPC.create()

export const trpcRouter = t.router({
  getOrders: t.procedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ input }) => {
      return db.select().from(orders).where(eq(orders.orgId, input.orgId))
    }),

  getProducts: t.procedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ input }) => {
      return db.select().from(products).where(eq(products.orgId, input.orgId))
    }),

  getAuditLog: t.procedure
    .input(z.object({ orgId: z.string().uuid(), limit: z.number().optional().default(50) }))
    .query(async ({ input }) => {
      return db.select().from(auditLog)
        .where(eq(auditLog.orgId, input.orgId))
        .limit(input.limit)
    }),

  getDashboardStats: t.procedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ input }) => {
      const allOrders = await db.select().from(orders).where(eq(orders.orgId, input.orgId))
      const totalOrders = allOrders.length
      const pendingOrders = allOrders.filter(o => o.status === 'pending').length
      const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
      const paidOrders = allOrders.filter(o => o.payStatus === 'paid').length

      return { totalOrders, pendingOrders, totalRevenue, paidOrders }
    }),
})
