'use client'

import { useState } from 'react'

const defaultFeatures = {
  approvalWorkflow: { label: 'موافقات متعددة', desc: 'طلب موافقات على الطلبات الكبيرة', enabled: false },
  departmentBudgets: { label: 'ميزانيات الأقسام', desc: 'تخصيص ميزانية لكل قسم', enabled: false },
  advancedReporting: { label: 'تقارير متقدمة', desc: 'تحليلات ورسوم بيانية متقدمة', enabled: false },
  multiWarehouse: { label: 'مخازن متعددة', desc: 'إدارة أكثر من مخزن', enabled: false },
  supplierPortal: { label: 'بوابة الموردين', desc: 'الموردين يشوفون طلباتهم', enabled: true },
  whatsappNotify: { label: 'إشعارات واتساب', desc: 'إرسال إشعارات عبر واتساب', enabled: true },
  etaInvoicing: { label: 'الفاتورة الإلكترونية', desc: 'التكامل مع مصلحة الضرائب', enabled: true },
  autoShipment: { label: 'شحن تلقائي', desc: 'إنشاء الشحنة تلقائياً عند تأكيد الطلب', enabled: false },
}

type FeatureKey = keyof typeof defaultFeatures

export default function SettingsPage() {
  const [features, setFeatures] = useState(defaultFeatures)

  function toggle(key: FeatureKey) {
    setFeatures(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }))
  }

  return (
    <main className="min-h-screen p-6" dir="rtl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-bright">الإعدادات</h1>
        <p className="text-muted text-sm">Complexity Dial — تحكم في تعقيد النظام</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {(Object.entries(features) as [FeatureKey, typeof defaultFeatures[FeatureKey]][]).map(([key, feature]) => (
          <div key={key}
            className={`bg-surface border rounded-xl p-5 transition-all cursor-pointer
              ${feature.enabled ? 'border-green/30' : 'border-border'}
              hover:border-gold/30`}
            onClick={() => toggle(key)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-bright font-bold">{feature.label}</h3>
              <div className={`w-10 h-6 rounded-full transition-colors ${feature.enabled ? 'bg-green' : 'bg-border'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-all mt-1 ${feature.enabled ? 'mr-5' : 'mr-1'}`} />
              </div>
            </div>
            <p className="text-muted text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-bright font-bold">معلومات الشركة</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sub text-sm mb-1">اسم الشركة</label>
            <input className="w-full bg-raised border border-border rounded-lg p-2 text-bright" defaultValue="IRTH Group" />
          </div>
          <div>
            <label className="block text-sub text-sm mb-1">الرقم الضريبي</label>
            <input className="w-full bg-raised border border-border rounded-lg p-2 text-bright font-mono" defaultValue="XXX-XXX-XXX" />
          </div>
        </div>
      </div>
    </main>
  )
}
