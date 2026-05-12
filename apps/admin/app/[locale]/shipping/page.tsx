'use client'

import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '@/lib/api'

type Shipment = {
  id: string
  orderId: string
  provider: string
  trackingNumber: string | null
  awbUrl: string | null
  status: string
  customerName: string | null
  governorate: string | null
  createdAt: string
}

export default function ShippingPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Shipment[]>('/api/v1/shipping/list?orgId=00000000-0000-0000-0000-000000000000')
      .then(res => { if (res.data) setShipments(res.data); setLoading(false) })
  }, [])

  return (
    <main className="min-h-screen p-6" dir="rtl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-bright">الشحن</h1>
        <p className="text-muted text-sm">إدارة الشحن والتوصيل</p>
      </header>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-border text-muted text-sm">
              <th className="p-4 font-medium">رقم التتبع</th>
              <th className="p-4 font-medium">العميل</th>
              <th className="p-4 font-medium">المحافظة</th>
              <th className="p-4 font-medium">المزود</th>
              <th className="p-4 font-medium">الحالة</th>
              <th className="p-4 font-medium">التاريخ</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="p-8 text-center text-muted">جارِ التحميل...</td></tr>
            )}
            {!loading && shipments.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted">لا توجد شحنات</td></tr>
            )}
            {shipments.map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-raised/50 transition-colors">
                <td className="p-4 font-mono text-sm text-blue">{s.trackingNumber || '—'}</td>
                <td className="p-4 text-bright">{s.customerName || '—'}</td>
                <td className="p-4 text-sub">{s.governorate || '—'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${s.provider === 'bosta' ? 'bg-green/10 text-green' : 'bg-purple/10 text-purple'}`}>
                    {s.provider === 'bosta' ? 'Bosta' : 'Mylerz'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded text-xs bg-blue/10 text-blue">
                    {s.status}
                  </span>
                </td>
                <td className="p-4 text-muted text-sm">{new Date(s.createdAt).toLocaleDateString('ar-EG')}</td>
                <td className="p-4">
                  {s.awbUrl && (
                    <a href={s.awbUrl} target="_blank" rel="noreferrer"
                      className="px-2 py-1 text-xs rounded bg-raised border border-border text-sub hover:text-gold transition-colors">
                      البوليصة
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
