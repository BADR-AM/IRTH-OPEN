import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Cairo, Noto_Sans_Arabic } from 'next/font/google'
import type { ReactNode } from 'react'
import Link from 'next/link'
import '../globals.css'

const noto = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-display',
  display: 'swap',
})

const navItems = [
  { href: '/', label: 'لوحة التحكم', icon: '◇' },
  { href: '/orders', label: 'الطلبات', icon: '📋' },
  { href: '/products', label: 'المنتجات', icon: '📦' },
]

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir} className={`${noto.variable} ${cairo.variable}`}>
      <body className="font-arabic antialiased bg-background">
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen">
            <aside className="w-64 bg-deep border-l border-border sticky top-0 h-screen overflow-y-auto flex-shrink-0 hidden md:block">
              <div className="p-5 border-b border-border">
                <div className="text-lg font-bold text-gold tracking-widest font-display">IRTH OS</div>
                <div className="text-xs text-muted mt-1">master blueprint</div>
              </div>
              <nav className="p-3">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={`/${locale}${item.href}`}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sub hover:text-gold2 hover:bg-gold/5 transition-colors text-sm"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </aside>
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
