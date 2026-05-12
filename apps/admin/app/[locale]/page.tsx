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

type CashFlow = {
  cashOnHand: number
  inTransit: number
  owed: number
  netCashFlow: number
  paidRevenue: number
  pendingCOD: number
  paidExpenses: number
  pendingExpenses: number
  deliveredOrders: number
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [cash, setCash] = useState<CashFlow | null>(null)

  useEffect(() => {
    apiGet<DashboardStats>('/api/v1/orders/stats/dashboard?orgId=00000000-0000-0000-0000-000000000000')
      .then(res => { if (res.data) setStats(res.data) })

    apiGet<CashFlow>('/api/v1/finance/cash-flow?orgId=00000000-0000-0000-0000-000000000000')
      .then(res => { if (res.data) setCash(res.data) })
  }, [])

  const cards = [
    { label: t('totalOrders'), value: stats?.totalOrders ?? '—' },
    { label: t('pendingOrders'), value: stats?.pendingOrders ?? '—' },
    { label: t('totalRevenue'), value: stats ? `${stats.totalRevenue.toLocaleString()} EGP` : '—' },
    { label: t('paidOrders'), value: stats?.paidOrders ?? '—' },
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

      {cash && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-bright mb-4">💰 Cash Flow Clarity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface border border-green/30 rounded-xl p-5">
              <p className="text-green text-sm mb-1">نقدي حقيقي</p>
              <p className="text-2xl font-bold text-green">{cash.cashOnHand.toLocaleString()} EGP</p>
              <p className="text-muted text-xs mt-1">إيرادات مؤكدة - مصروفات مؤكدة</p>
            </div>
            <div className="bg-surface border border-blue/30 rounded-xl p-5">
              <p className="text-blue text-sm mb-1">في الطريق</p>
              <p className="text-2xl font-bold text-blue">{cash.inTransit.toLocaleString()} EGP</p>
              <p className="text-muted text-xs mt-1">COD لم يتم تحصيله بعد</p>
            </div>
            <div className="bg-surface border border-red/30 rounded-xl p-5">
              <p className="text-red text-sm mb-1">مستحق</p>
              <p className="text-2xl font-bold text-red">{cash.owed.toLocaleString()} EGP</p>
              <p className="text-muted text-xs mt-1">مصروفات معلقة ومستحقة</p>
            </div>
          </div>
          <div className="mt-4 bg-gold/5 border border-gold/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-gold2 font-bold">صافي التدفق النقدي</span>
              <span className={`text-2xl font-bold ${cash.netCashFlow >= 0 ? 'text-green' : 'text-red'}`}>
                {cash.netCashFlow >= 0 ? '+' : ''}{cash.netCashFlow.toLocaleString()} EGP
              </span>
            </div>
          </div>
        </div>
      )}

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
            <Link href="/shipping" className="block p-3 bg-raised rounded-lg border border-border text-sub hover:text-gold hover:border-gold transition-colors">
              ← إدارة الشحن
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
