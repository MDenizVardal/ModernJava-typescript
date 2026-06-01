import { useState } from 'react'
import { Save, Key, User, Server, Sun, Moon, Info } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const { theme, toggle, isDark } = useTheme()

  const [profile, setProfile] = useState({ full_name: user?.full_name || '', email: user?.email || '', phone: user?.phone || '' })
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const handleProfileSave = async () => {
    setSavingProfile(true)
    try {
      await api.put('/auth/profile', profile)
      await refreshUser()
      toast.success('Profil güncellendi')
    } catch { toast.error('Profil güncellenemedi') }
    setSavingProfile(false)
  }

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new) { toast.error('Tüm alanları doldurun'); return }
    if (passwords.new !== passwords.confirm) { toast.error('Yeni şifreler eşleşmiyor'); return }
    if (passwords.new.length < 6) { toast.error('Şifre en az 6 karakter olmalı'); return }
    setSavingPw(true)
    try {
      await api.put('/auth/change-password', { current_password: passwords.current, new_password: passwords.new })
      setPasswords({ current: '', new: '', confirm: '' })
      toast.success('Şifre değiştirildi')
    } catch (err) { toast.error(err.response?.data?.error || 'Şifre değiştirilemedi') }
    setSavingPw(false)
  }

  const Section = ({ icon: Icon, title, children }) => (
    <div className="card p-6">
      <h2 className="section-title flex items-center gap-2 mb-5">
        <Icon className="w-5 h-5 text-primary-500" />{title}
      </h2>
      {children}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Profil */}
      <Section icon={User} title="Profil Bilgileri">
        <div className="space-y-4">
          <div>
            <label className="label">Ad Soyad</label>
            <input type="text" className="input-field" value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">E-posta</label>
              <input type="email" className="input-field" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input type="tel" className="input-field" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Kullanıcı adı: </span>
              <span className="font-mono font-medium">{user?.username}</span>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Rol: </span>
              <span className="font-medium">{user?.role === 'admin' ? 'Yönetici' : 'Danışman'}</span>
            </div>
          </div>
          <button onClick={handleProfileSave} disabled={savingProfile} className="btn-primary">
            <Save className="w-4 h-4" />{savingProfile ? 'Kaydediliyor...' : 'Profili Kaydet'}
          </button>
        </div>
      </Section>

      {/* Şifre */}
      <Section icon={Key} title="Şifre Değiştir">
        <div className="space-y-4">
          <div>
            <label className="label">Mevcut Şifre</label>
            <input type="password" className="input-field" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Yeni Şifre</label>
              <input type="password" className="input-field" value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} placeholder="En az 6 karakter" />
            </div>
            <div>
              <label className="label">Yeni Şifre (Tekrar)</label>
              <input type="password" className="input-field" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
            </div>
          </div>
          <button onClick={handlePasswordChange} disabled={savingPw} className="btn-primary">
            <Key className="w-4 h-4" />{savingPw ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
          </button>
        </div>
      </Section>

      {/* Görünüm */}
      <Section icon={isDark ? Moon : Sun} title="Görünüm">
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-600">
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-200">Tema</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isDark ? 'Koyu mod aktif' : 'Açık mod aktif'}</p>
          </div>
          <button onClick={toggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? 'bg-primary-600' : 'bg-slate-300'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isDark ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </Section>

      {/* Sunucu */}
      <Section icon={Server} title="Sistem Bilgisi">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <span className="text-slate-500 dark:text-slate-400">Sunucu Adresi</span>
            <span className="font-mono">http://localhost:3001</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <span className="text-slate-500 dark:text-slate-400">Veritabanı</span>
            <span className="font-mono">SQLite (Yerel)</span>
          </div>
          <p className="text-xs text-slate-400 flex items-start gap-1.5 mt-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            Çok kullanıcılı ağ kurulumu için sunucu bilgisayarın IP adresini diğer bilgisayarlara bildirin.
            Diğer bilgisayarlar bu uygulamayı açtığında, ayarlar sayfasından sunucu IP'sini yapılandırabilirler.
          </p>
        </div>
      </Section>

      {/* Hakkında */}
      <div className="card p-5 text-center">
        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
          <span className="text-white font-bold text-lg">G</span>
        </div>
        <p className="font-bold text-slate-800 dark:text-slate-200">Gülsa Emlak Yönetim Sistemi</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">Sürüm 1.0.0 · 2024</p>
      </div>
    </div>
  )
}
