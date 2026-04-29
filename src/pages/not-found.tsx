import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const { t } = useTranslation('common')
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="text-6xl font-semibold">404</div>
      <p className="text-muted-foreground">{t('noResults')}</p>
      <Button asChild>
        <Link to="/">{t('nav.dashboard')}</Link>
      </Button>
    </div>
  )
}
