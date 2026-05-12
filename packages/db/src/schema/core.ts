import {
  pgTable, uuid, varchar, text, boolean,
  timestamp, integer, decimal, jsonb, pgEnum
} from 'drizzle-orm/pg-core'

export const brandEnum     = pgEnum('brand',          ['sidr', 'bereket'])
export const orderStatus   = pgEnum('order_status',   ['pending','confirmed','processing','shipped','delivered','cancelled','returned'])
export const paymentMethod = pgEnum('payment_method', ['paymob','fawry','cod','stripe'])
export const paymentStatus = pgEnum('payment_status', ['pending','paid','failed','refunded'])
export const userRole      = pgEnum('user_role',      ['super_admin','operations','marketing','warehouse','supplier','cs'])

const baseColumns = {
  id:        uuid('id').primaryKey().defaultRandom(),
  orgId:     uuid('org_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}

export const organizations = pgTable('organizations', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        varchar({length: 200}).notNull(),
  slug:        varchar({length: 100}).unique().notNull(),
  plan:        varchar({length: 50}).default('free'),
  settings:    jsonb('settings').default({}),
  createdAt:   timestamp('created_at').defaultNow(),
})

export const users = pgTable('users', {
  id:          uuid('id').primaryKey().defaultRandom(),
  orgId:       uuid('org_id').notNull(),
  email:       varchar({length: 255}).unique().notNull(),
  name:        varchar({length: 200}).notNull(),
  phone:       varchar({length: 20}),
  role:        userRole().default('operations'),
  isActive:    boolean('is_active').default(true),
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow(),
})

export const products = pgTable('products', {
  ...baseColumns,
  brand:        brandEnum().notNull(),
  nameAr:       varchar('name_ar',  {length: 200}).notNull(),
  nameEn:       varchar('name_en',  {length: 200}),
  descAr:       text('desc_ar'),
  categoryId:   uuid('category_id'),
  isActive:     boolean('is_active').default(true),
  isFeatured:   boolean('is_featured').default(false),
})

export const productVariants = pgTable('product_variants', {
  ...baseColumns,
  productId:   uuid('product_id').notNull(),
  sku:         varchar({length: 100}).unique().notNull(),
  sizeLabel:   varchar('size_label', {length: 50}),
  price:       decimal({precision: 10, scale: 2}).notNull(),
  salePrice:   decimal('sale_price', {precision: 10, scale: 2}),
  stockQty:    integer('stock_qty').default(0).notNull(),
  weightGrams: integer('weight_grams'),
  barcode:     varchar({length: 60}),
})

export const orders = pgTable('orders', {
  ...baseColumns,
  orderNumber:   varchar('order_number', {length: 30}).unique().notNull(),
  brand:         brandEnum().notNull(),
  customerId:    uuid('customer_id'),
  status:        orderStatus().default('pending').notNull(),
  subtotal:      decimal({precision: 12, scale: 2}).notNull(),
  shippingCost:  decimal('shipping_cost', {precision: 8, scale: 2}).default('0'),
  discountAmount: decimal('discount_amount', {precision: 8, scale: 2}).default('0'),
  vatAmount:     decimal('vat_amount', {precision: 10, scale: 2}).default('0'),
  totalAmount:   decimal('total_amount', {precision: 12, scale: 2}).notNull(),
  payMethod:     paymentMethod('pay_method').notNull(),
  payStatus:     paymentStatus('pay_status').default('pending'),
  governorate:   varchar({length: 100}),
  addressLine:   text('address_line'),
  customerPhone: varchar('customer_phone', {length: 20}),
  customerName:  varchar('customer_name', {length: 200}),
  source:        varchar({length: 50}).default('website'),
  etaReceiptId:  varchar('eta_receipt_id', {length: 100}),
  notes:         text(),
})

export const orderItems = pgTable('order_items', {
  id:           uuid('id').primaryKey().defaultRandom(),
  orgId:        uuid('org_id').notNull(),
  orderId:      uuid('order_id').notNull(),
  variantId:    uuid('variant_id').notNull(),
  productName:  varchar('product_name', {length: 200}).notNull(),
  qty:          integer().notNull(),
  unitPrice:    decimal('unit_price', {precision: 10, scale: 2}).notNull(),
  totalPrice:   decimal('total_price', {precision: 12, scale: 2}).notNull(),
  createdAt:    timestamp('created_at').defaultNow(),
})

export const categories = pgTable('categories', {
  id:         uuid('id').primaryKey().defaultRandom(),
  orgId:      uuid('org_id').notNull(),
  nameAr:     varchar('name_ar', {length: 200}).notNull(),
  nameEn:     varchar('name_en', {length: 200}),
  slug:       varchar({length: 100}).unique().notNull(),
  parentId:   uuid('parent_id'),
  isActive:   boolean('is_active').default(true),
  sortOrder:  integer('sort_order').default(0),
  createdAt:  timestamp('created_at').defaultNow(),
  updatedAt:  timestamp('updated_at').defaultNow(),
})

export const auditLog = pgTable('audit_log', {
  id:         uuid().primaryKey().defaultRandom(),
  orgId:      uuid('org_id').notNull(),
  userId:     uuid('user_id'),
  userRole:   varchar('user_role', {length: 50}),
  action:     varchar({length: 100}).notNull(),
  table:      varchar({length: 100}),
  recordId:   uuid('record_id'),
  before:     jsonb(),
  after:      jsonb(),
  ip:         varchar({length: 45}),
  executedAt: timestamp('executed_at').defaultNow(),
})
