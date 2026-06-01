import { Sun, Moon, Bell, Plus } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function Header({ title }) {
  const { toggle, isDark } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
      <h1 className="page-title">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/properties/new')}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4" />
          Yeni İlan
        </button>
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          title={isDark ? 'Açık mod' : 'Koyu mod'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  )
}
