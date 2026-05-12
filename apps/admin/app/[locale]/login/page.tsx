import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('auth')

  return (
    <div className="min-h-screen flex items-center justify-center bg-void p-4">
      <div className="bg-surface border border-border rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gold mb-2">IRTH OS</h1>
          <p className="text-muted text-sm">{t('loginTitle')}</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sub text-sm mb-1" htmlFor="email">{t('email')}</label>
            <input
              id="email"
              type="email"
              className="w-full bg-raised border border-border rounded-lg p-3 text-bright focus:border-gold outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sub text-sm mb-1" htmlFor="password">{t('password')}</label>
            <input
              id="password"
              type="password"
              className="w-full bg-raised border border-border rounded-lg p-3 text-bright focus:border-gold outline-none"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gold text-void font-bold py-3 rounded-lg hover:bg-gold2 transition-colors"
          >
            {t('loginButton')}
          </button>
        </form>
      </div>
    </div>
  )
}
