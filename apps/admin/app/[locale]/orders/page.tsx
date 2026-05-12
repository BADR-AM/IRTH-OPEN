'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { apiGet, apiPatch } from '@/lib/api'

type Order = {
  id: string
  orderNumber: string
  brand: 'sidr' | 'bereket'
  customerName: string | null
  customerPhone: string | null
  status: string
  totalAmount: string
  payStatus: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow/10 text-yellow',
  confirmed: 'bg-blue/10 text-blue',
  processing: 'bg-purple/10 text-purple',
  shipped: 'bg-orange/10 text-orange',
  delivered: 'bg-green/10 text-green',
  cancelled: 'bg-red/10 text-red',
  returned: 'bg-red/10 text-red',
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
}

export default function OrdersPage() {
  const t = useTranslations('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Order[]>('/api/v1/orders?orgId=00000000-0000-0000-0000-000000000000')
      .then(res => { if (res.data) setOrders(res.data); setLoading(false) })
  }, [])

  async function handleStatus(orderId: string, newStatus: string) {
    const res = await apiPatch(`/api/v1/orders/${orderId}/status`, { status: newStatus })
    if (res.data) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    }
  }

  return (
    <main className="min-h-screen p-6" dir="rtl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-bright">{t('title')}</h1>
      </header>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-border text-muted text-sm">
              <th className="p-4 font-medium">{t('orderNumber')}</th>
              <th className="p-4 font-medium">{t('customer')}</th>
              <th className="p-4 font-medium">{t('status')}</th>
              <th className="p-4 font-medium">{t('total')}</th>
              <th className="p-4 font-medium">{t('date')}</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-8 text-center text-muted">جارِ التحميل...</td></tr>
            )}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted">لا توجد طلبات</td></tr>
            )}
            {orders.map(order => {
              const nextStatuses = STATUS_TRANSITIONS[order.status] ?? []
              return (
                <tr key={order.id} className="border-b border-border/50 hover:bg-raised/50 transition-colors">
                  <td className="p-4 font-mono text-sm text-blue">{order.orderNumber}</td>
                  <td className="p-4">
                    <div className="text-bright">{order.customerName || '—'}</div>
                    <div className="text-muted text-xs">{order.customerPhone || ''}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${STATUS_COLORS[order.status] || 'text-muted'}`}>
                      {t(order.status) || order.status}
                    </span>
                  </td>
                  <td className="p-4 text-bright font-mono">{Number(order.totalAmount).toLocaleString()} EGP</td>
                  <td className="p-4 text-muted text-sm">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td className="p-4">
                    {nextStatuses.length > 0 && (
                      <div className="flex gap-1">
                        {nextStatuses.map(s => (
                          <button
                            key={s}
                            onClick={() => handleStatus(order.id, s)}
                            className="px-2 py-1 text-xs rounded bg-raised border border-border text-sub hover:bg-gold hover:text-void hover:border-gold transition-colors"
                          >
                            {t(s)}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
