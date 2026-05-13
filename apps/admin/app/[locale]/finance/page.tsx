'use client'

import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '@/lib/api'

type Expense = {
  id: string
  category: string
  amount: string
  description: string | null
  vendor: string | null
  status: string
  expenseDate: string
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

export default function FinancePage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [cashFlow, setCashFlow] = useState<CashFlow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiGet<Expense[]>('/api/v1/finance/expenses?orgId=00000000-0000-0000-0000-000000000000'),
      apiGet<CashFlow>('/api/v1/finance/cash-flow?orgId=00000000-0000-0000-0000-000000000000'),
    ]).then(([ex, cf]) => {
      if (ex.data) setExpenses(ex.data)
      if (cf.data) setCashFlow(cf.data)
      setLoading(false)
    })
  }, [])

  return (
    <main className="min-h-screen p-6" dir="rtl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-bright">الإدارة المالية</h1>
        <p className="text-muted text-sm">المصروفات والتدفق النقدي</p>
      </header>

      {cashFlow && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-green/30 rounded-xl p-4">
            <p className="text-green text-xs">صافي نقدي</p>
            <p className="text-xl font-bold text-green">{cashFlow.cashOnHand.toLocaleString()} EGP</p>
          </div>
          <div className="bg-surface border border-blue/30 rounded-xl p-4">
            <p className="text-blue text-xs">في الطريق</p>
            <p className="text-xl font-bold text-blue">{cashFlow.inTransit.toLocaleString()} EGP</p>
          </div>
          <div className="bg-surface border border-red/30 rounded-xl p-4">
            <p className="text-red text-xs">مستحق</p>
            <p className="text-xl font-bold text-red">{cashFlow.owed.toLocaleString()} EGP</p>
          </div>
          <div className="bg-surface border border-gold/30 rounded-xl p-4">
            <p className="text-gold2 text-xs">إيرادات مدفوعة</p>
            <p className="text-xl font-bold text-gold2">{cashFlow.paidRevenue.toLocaleString()} EGP</p>
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-bright font-bold">المصروفات</h3>
          <span className="text-muted text-sm">{expenses.length} مصروف</span>
        </div>
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-border text-muted text-sm">
              <th className="p-3 font-medium">التصنيف</th>
              <th className="p-3 font-medium">المبلغ</th>
              <th className="p-3 font-medium">الوصف</th>
              <th className="p-3 font-medium">المورد</th>
              <th className="p-3 font-medium">الحالة</th>
              <th className="p-3 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(ex => (
              <tr key={ex.id} className="border-b border-border/50 hover:bg-raised/50">
                <td className="p-3 text-bright">{ex.category}</td>
                <td className="p-3 font-mono text-blue">{Number(ex.amount).toLocaleString()} EGP</td>
                <td className="p-3 text-sub text-sm">{ex.description || '—'}</td>
                <td className="p-3 text-sub">{ex.vendor || '—'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${ex.status === 'paid' ? 'bg-green/10 text-green' : 'bg-yellow/10 text-yellow'}`}>
                    {ex.status === 'paid' ? 'مدفوع' : 'معلق'}
                  </span>
                </td>
                <td className="p-3 text-muted text-sm">{ex.expenseDate ? new Date(ex.expenseDate).toLocaleDateString('ar-EG') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
