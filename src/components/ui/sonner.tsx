import { Toaster as SonnerToaster, toast } from 'sonner'
import { useAppStore } from '@/store/app-store'

function Toaster() {
  const theme = useAppStore((s) => s.theme)
  const locale = useAppStore((s) => s.locale)
  return (
    <SonnerToaster
      theme={theme}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      position={locale === 'ar' ? 'bottom-left' : 'bottom-right'}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
    />
  )
}

export { Toaster, toast }
