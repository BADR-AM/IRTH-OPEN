export type ApiResponse<T = unknown> = {
  data: T | null
  error: string | null
  meta?: Record<string, unknown>
}

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
export type PaymentMethod = 'paymob' | 'fawry' | 'cod' | 'stripe'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type Brand = 'sidr' | 'bereket'
export type UserRole = 'super_admin' | 'operations' | 'marketing' | 'warehouse' | 'supplier' | 'cs'
