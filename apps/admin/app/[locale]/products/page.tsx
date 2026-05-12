'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { apiGet, apiPost, apiDelete } from '@/lib/api'

type Product = {
  id: string
  nameAr: string
  nameEn: string | null
  brand: 'sidr' | 'bereket'
  isActive: boolean
  price?: string
}

export default function ProductsPage() {
  const t = useTranslations('products')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Product[]>('/api/v1/products?orgId=00000000-0000-0000-0000-000000000000')
      .then(res => { if (res.data) setProducts(res.data); setLoading(false) })
  }, [])

  return (
    <main className="min-h-screen p-6" dir="rtl">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-bright">{t('title')}</h1>
        </div>
        <button className="bg-gold text-void px-4 py-2 rounded-lg font-bold text-sm hover:bg-gold2 transition-colors">
          + {t('title')}
        </button>
      </header>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-border text-muted text-sm">
              <th className="p-4 font-medium">{t('name')}</th>
              <th className="p-4 font-medium">{t('brand')}</th>
              <th className="p-4 font-medium">{t('price')}</th>
              <th className="p-4 font-medium">{t('stock')}</th>
              <th className="p-4 font-medium">{t('active')}</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-8 text-center text-muted">جارِ التحميل...</td></tr>
            )}
            {!loading && products.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted">لا توجد منتجات</td></tr>
            )}
            {products.map(p => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-raised/50 transition-colors">
                <td className="p-4 text-bright">{p.nameAr}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.brand === 'sidr' ? 'bg-purple/10 text-purple' : 'bg-green/10 text-green'}`}>
                    {p.brand.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-sub">{p.price || '—'}</td>
                <td className="p-4 text-sub">—</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${p.isActive ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
                    {p.isActive ? t('active') : t('inactive')}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-muted hover:text-gold transition-colors text-sm">تعديل</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
