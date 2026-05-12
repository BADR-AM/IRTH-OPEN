'use client'

import { useState, useEffect } from 'react'
import { apiGet } from '@/lib/api'

type Supplier = {
  id: string
  name: string
  contactName: string | null
  phone: string | null
  brand: string | null
  isActive: boolean
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Supplier[]>('/api/v1/suppliers?orgId=00000000-0000-0000-0000-000000000000')
      .then(res => { if (res.data) setSuppliers(res.data); setLoading(false) })
  }, [])

  return (
    <main className="min-h-screen p-6" dir="rtl">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-bright">الموردون</h1>
          <p className="text-muted text-sm">إدارة الموردين وأوامر الشراء</p>
        </div>
        <button className="bg-gold text-void px-4 py-2 rounded-lg font-bold text-sm hover:bg-gold2">
          + مورد جديد
        </button>
      </header>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-border text-muted text-sm">
              <th className="p-4 font-medium">الاسم</th>
              <th className="p-4 font-medium">جهة الاتصال</th>
              <th className="p-4 font-medium">الهاتف</th>
              <th className="p-4 font-medium">البراند</th>
              <th className="p-4 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-8 text-center text-muted">جارِ التحميل...</td></tr>}
            {!loading && suppliers.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted">لا يوجد موردون</td></tr>}
            {suppliers.map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-raised/50">
                <td className="p-4 text-bright">{s.name}</td>
                <td className="p-4 text-sub">{s.contactName || '—'}</td>
                <td className="p-4 font-mono text-sm text-blue">{s.phone || '—'}</td>
                <td className="p-4">
                  {s.brand && <span className="px-2 py-1 rounded text-xs font-bold bg-purple/10 text-purple">{s.brand}</span>}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${s.isActive ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
                    {s.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
