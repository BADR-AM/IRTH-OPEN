'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { apiGet } from '@/lib/api'
import Link from 'next/link'

type DashboardStats = {
  totalOrders: number
  pendingOrders: number
  paidOrders: number
  shippedOrders: number
  totalRevenue: number
  paidRevenue: number
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    apiGet<DashboardStats>('/api/v1/orders/stats/dashboard?orgId=00000000-0000-0000-0000-000000000000')
      .then(res => { if (res.data) setStats(res.data) })
  }, [])

  const cards = [
    { label: t('totalOrders'), value: stats?.totalOrders ?? '—' },
    { label: t('pendingOrders'), value: stats?.pendingOrders ?? '—' },
    { label: t('paidOrders'), value: `${(stats?.paidRevenue ?? 0).toLocaleString()} EGP` },
    { label: 'شحن', value: stats?.shippedOrders ?? '—' },
  ]

  return (
    <div className="p-6" dir="rtl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gold2">{t('title')}</h1>
        <p className="text-muted text-sm">IRTH Operations System</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5">
            <p className="text-muted text-sm mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-bright">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-bright font-bold mb-4">إجمالي الإيرادات</h3>
          <p className="text-3xl font-bold text-green">{stats ? `${stats.totalRevenue.toLocaleString()} EGP` : '—'}</p>
          <p className="text-muted text-sm mt-1">{stats?.paidOrders ?? 0} طلب مدفوع</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-bright font-bold mb-4">روابط سريعة</h3>
          <div className="space-y-3">
            <Link href="/orders" className="block p-3 bg-raised rounded-lg border border-border text-sub hover:text-gold hover:border-gold transition-colors">
              ← إدارة الطلبات
            </Link>
            <Link href="/products" className="block p-3 bg-raised rounded-lg border border-border text-sub hover:text-gold hover:border-gold transition-colors">
              ← إدارة المنتجات
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
