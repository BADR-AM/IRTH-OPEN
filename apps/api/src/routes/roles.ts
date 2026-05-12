import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../env.d'
import { db, roles, permissions, rolePermissions, userRoles } from '@irth/db'
import { eq, and } from 'drizzle-orm'

export const rolesRouter = new Hono<{Bindings: Env}>()

const createRoleSchema = z.object({
  orgId: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
})

const createPermissionSchema = z.object({
  orgId: z.string().uuid(),
  resource: z.string().min(1),
  action: z.string().min(1),
  scope: z.any().optional(),
})

rolesRouter.get('/', async (c) => {
  const orgId = c.req.query('orgId')
  if (!orgId) return c.json({ data: null, error: 'orgId is required' }, 400)
  const list = await db.select().from(roles).where(eq(roles.orgId, orgId))
  return c.json({ data: list, error: null })
})

rolesRouter.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createRoleSchema.safeParse(body)
  if (!parsed.success) return c.json({ data: null, error: parsed.error.message }, 400)
  const [role] = await db.insert(roles).values(parsed.data).returning()
  return c.json({ data: role, error: null }, 201)
})

rolesRouter.get('/:id/permissions', async (c) => {
  const id = c.req.param('id')
  const rp = await db.select({ permission: permissions })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, id))
  return c.json({ data: rp.map(r => r.permission), error: null })
})

rolesRouter.post('/:id/permissions', async (c) => {
  const roleId = c.req.param('id')
  const body = await c.req.json()
  const { permissionIds } = z.object({ permissionIds: z.array(z.string().uuid()) }).parse(body)

  for (const permissionId of permissionIds) {
    await db.insert(rolePermissions).values({ roleId, permissionId }).onConflictDoNothing()
  }
  return c.json({ data: { assigned: permissionIds.length }, error: null }, 201)
})

export const permissionsRouter = new Hono<{Bindings: Env}>()

permissionsRouter.get('/', async (c) => {
  const orgId = c.req.query('orgId')
  if (!orgId) return c.json({ data: null, error: 'orgId is required' }, 400)
  const list = await db.select().from(permissions).where(eq(permissions.orgId, orgId))
  return c.json({ data: list, error: null })
})

permissionsRouter.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createPermissionSchema.safeParse(body)
  if (!parsed.success) return c.json({ data: null, error: parsed.error.message }, 400)
  const [perm] = await db.insert(permissions).values(parsed.data).returning()
  return c.json({ data: perm, error: null }, 201)
})
