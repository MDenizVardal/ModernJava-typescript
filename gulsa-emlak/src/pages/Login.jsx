import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { toast.error('Lütfen tüm alanları doldurun'); return }
    setLoading(true)
    const res = await login(form.username, form.password)
    setLoading(false)
    if (res.ok) {
      toast.success('Hoş geldiniz!')
      navigate('/dashboard')
    } else {
      toast.error(res.error || 'Giriş başarısız')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 p-4">
      {/* Arka plan deseni */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white/5"
            style={{ width: `${200 + i * 100}px`, height: `${200 + i * 100}px`, top: `${10 + i * 15}%`, left: `${-5 + i * 18}%` }} />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gold-400 rounded-2xl shadow-xl mb-4">
            <Building2 className="w-10 h-10 text-primary-900" />
          </div>
          <h1 className="text-3xl font-bold text-white">Gülsa Emlak</h1>
          <p className="text-primary-200 mt-1">Gayrimenkul Yönetim Sistemi</p>
        </div>

        {/* Form kartı */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Giriş Yapın</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Kullanıcı Adı</label>
              <input
                type="text"
                className="input-field"
                placeholder="kullanici_adi"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                autoFocus
              />
            </div>
            <div>
              <label className="label">Şifre</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary justify-center py-3 text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Giriş yapılıyor...
                </span>
              ) : (
                <><LogIn className="w-5 h-5" />Giriş Yap</>
              )}
            </button>
          </form>
          <p className="text-center text-xs text-slate-400 mt-6">
            İlk kullanımda: <span className="font-mono text-slate-500">admin / admin123</span>
          </p>
        </div>
        <p className="text-center text-primary-300 text-xs mt-6">© 2024 Gülsa Emlak · Tüm hakları saklıdır</p>
      </div>
    </div>
  )
}
