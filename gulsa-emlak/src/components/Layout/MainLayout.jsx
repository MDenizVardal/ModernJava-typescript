import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { Toaster } from 'react-hot-toast'

const PAGE_TITLES = {
  '/dashboard':   'Panel',
  '/properties':  'İlan Yönetimi',
  '/map':         'Harita Görünümü',
  '/gallery':     'Fotoğraf Galerisi',
  '/agents':      'Danışman Yönetimi',
  '/statistics':  'İstatistikler',
  '/settings':    'Ayarlar',
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()

  const title = PAGE_TITLES[pathname] ||
    (pathname.startsWith('/properties/new') ? 'Yeni İlan Ekle' :
     pathname.startsWith('/properties/') ? 'İlan Detayı' : 'Gülsa Emlak')

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: '12px', fontSize: '14px' },
        }}
      />
    </div>
  )
}
