import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Map, Images, Users, BarChart3,
  Settings, LogOut, ChevronLeft, ChevronRight, Wifi, WifiOff
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Panel' },
  { to: '/properties',  icon: Building2,        label: 'İlanlar' },
  { to: '/map',         icon: Map,              label: 'Harita' },
  { to: '/gallery',     icon: Images,           label: 'Galeri' },
  { to: '/agents',      icon: Users,            label: 'Danışmanlar', adminOnly: true },
  { to: '/statistics',  icon: BarChart3,        label: 'İstatistikler' },
  { to: '/settings',    icon: Settings,         label: 'Ayarlar' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, isAdmin } = useAuth()
  const { connected } = useSocket()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <aside className={`flex flex-col h-full bg-primary-600 dark:bg-primary-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} flex-shrink-0`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-primary-500/30">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-gold-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary-900" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-none truncate">Gülsa Emlak</p>
              <p className="text-primary-200 text-xs mt-0.5">Yönetim Sistemi</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gold-400 rounded-lg flex items-center justify-center mx-auto">
            <Building2 className="w-5 h-5 text-primary-900" />
          </div>
        )}
        {!collapsed && (
          <button onClick={onToggle} className="p-1 rounded-lg hover:bg-primary-500/30 text-primary-200 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={onToggle} className="flex justify-center py-2 hover:bg-primary-500/30 text-primary-200 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, adminOnly }) => {
          if (adminOnly && !isAdmin) return null
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                ${isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-primary-200 hover:bg-white/10 hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer: bağlantı + kullanıcı */}
      <div className="border-t border-primary-500/30 p-3 space-y-2">
        {/* Bağlantı durumu */}
        {!collapsed && (
          <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${connected ? 'text-green-300' : 'text-red-300'}`}>
            {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {connected ? 'Bağlı' : 'Bağlantı yok'}
          </div>
        )}
        {/* Kullanıcı */}
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gold-400 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-900 font-bold text-xs">{user?.full_name?.charAt(0) || 'U'}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-primary-300 text-xs capitalize">{user?.role === 'admin' ? 'Yönetici' : 'Danışman'}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-primary-500/30 text-primary-200 hover:text-white transition-colors flex-shrink-0"
            title="Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
