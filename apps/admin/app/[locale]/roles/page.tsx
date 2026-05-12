'use client'

import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '@/lib/api'

type Role = {
  id: string
  name: string
  slug: string
  isSystem: boolean
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    apiGet<Role[]>('/api/v1/roles?orgId=00000000-0000-0000-0000-000000000000')
      .then(res => { if (res.data) setRoles(res.data); setLoading(false) })
  }, [])

  async function createRole() {
    if (!newName.trim()) return
    const slug = newName.trim().toLowerCase().replace(/ /g, '_')
    const res = await apiPost('/api/v1/roles', {
      orgId: '00000000-0000-0000-0000-000000000000',
      name: newName.trim(),
      slug,
    })
    if (res.data) {
      setRoles(prev => [...prev, res.data as Role])
      setNewName('')
    }
  }

  return (
    <main className="min-h-screen p-6" dir="rtl">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-bright">الأدوار والصلاحيات</h1>
      </header>

      <div className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="اسم الدور الجديد"
          className="bg-raised border border-border rounded-lg p-2 text-bright flex-1"
          onKeyDown={e => e.key === 'Enter' && createRole()}
        />
        <button onClick={createRole} className="bg-gold text-void px-4 py-2 rounded-lg font-bold text-sm">
          إضافة دور
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-border text-muted text-sm">
              <th className="p-4 font-medium">الاسم</th>
              <th className="p-4 font-medium">Slug</th>
              <th className="p-4 font-medium">النوع</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(r => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-raised/50">
                <td className="p-4 text-bright">{r.name}</td>
                <td className="p-4 font-mono text-sm text-blue">{r.slug}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${r.isSystem ? 'bg-purple/10 text-purple' : 'bg-green/10 text-green'}`}>
                    {r.isSystem ? 'system' : 'custom'}
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
