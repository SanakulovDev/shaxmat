import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RouterProvider } from 'react-router'
import { useAuth } from './auth/store'
import { router } from './router'

export function App() {
  const { t } = useTranslation()
  const status = useAuth((state) => state.status)
  const restore = useAuth((state) => state.restore)

  useEffect(() => {
    void restore()
  }, [restore])

  if (status === 'loading') {
    return (
      <p className="p-8 text-center text-muted">{t('common.loading')}</p>
    )
  }
  return <RouterProvider router={router} />
}
