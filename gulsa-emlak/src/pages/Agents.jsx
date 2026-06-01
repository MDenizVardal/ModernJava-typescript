import { useEffect, useState } from 'react'
import { UserPlus, Edit2, UserX, Users, Phone, Mail, Building2 } from 'lucide-react'
import api from '../api/client'
import Modal, { ConfirmModal } from '../components/UI/Modal'
import Badge from '../components/UI/Badge'
import { FullPageLoader } from '../components/UI/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

const EMPTY_FORM = { username:'', password:'', full_name:'', email:'', phone:'', role:'agent', active:true }

export default function Agents() {
  const [agents, setAgents]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null) // 'add' | 'edit'
  const [form, setForm]           = useState(EMPTY_FORM)
  const [editId, setEditId]       = useState(null)
  const [deactivateTarget, setDeactivateTarget] = useState(null)
  const [saving, setSaving]       = useState(false)
  const { isAdmin } = useAuth()

  const fetchAgents = () => {
    api.get('/agents').then(r => { setAgents(r.data); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchAgents() }, [])

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal('form') }
  const openEdit = (agent) => {
    setForm({ username: agent.username, password: '', full_name: agent.full_name, email: agent.email || '', phone: agent.phone || '', role: agent.role, active: Boolean(agent.active) })
    setEditId(agent.id)
    setModal('form')
  }

  const handleSave = async () => {
    if (!form.full_name || (!editId && !form.username)) { toast.error('Ad soyad ve kullanıcı adı zorunlu'); return }
    setSaving(true)
    try {
      if (editId) {
        await api.put(`/agents/${editId}`, form)
        toast.success('Danışman güncellendi')
      } else {
        if (!form.password) { toast.error('Şifre zorunlu'); setSaving(false); return }
        await api.post('/agents', form)
        toast.success('Danışman eklendi')
      }
      setModal(null)
      fetchAgents()
    } catch (err) { toast.error(err.response?.data?.error || 'İşlem başarısız') }
    setSaving(false)
  }

  const handleDeactivate = async () => {
    await api.delete(`/agents/${deactivateTarget.id}`)
    toast.success('Danışman devre dışı bırakıldı')
    fetchAgents()
  }

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  if (loading) return <FullPageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 dark:text-slate-400 text-sm">{agents.length} danışman</p>
        {isAdmin && (
          <button onClick={openAdd} className="btn-primary"><UserPlus className="w-4 h-4" />Yeni Danışman</button>
        )}
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Henüz danışman yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <div key={agent.id} className={`card p-5 ${!agent.active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{agent.full_name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{agent.full_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">@{agent.username}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Badge color={agent.role === 'admin' ? 'navy' : 'gray'}>{agent.role === 'admin' ? 'Yönetici' : 'Danışman'}</Badge>
                  {!agent.active && <Badge color="red">Pasif</Badge>}
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400 mb-4">
                {agent.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{agent.email}</p>}
                {agent.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{agent.phone}</p>}
                <p className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5" />{agent.property_count || 0} ilan</p>
                {agent.last_login && (
                  <p className="text-xs text-slate-400">
                    Son giriş: {format(new Date(agent.last_login), 'd MMM yyyy HH:mm', { locale: tr })}
                  </p>
                )}
              </div>

              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => openEdit(agent)} className="btn-secondary text-sm flex-1 justify-center">
                    <Edit2 className="w-3.5 h-3.5" />Düzenle
                  </button>
                  {agent.active && (
                    <button onClick={() => setDeactivateTarget(agent)} className="btn-ghost text-sm text-red-500">
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modalı */}
      <Modal
        open={modal === 'form'}
        onClose={() => setModal(null)}
        title={editId ? 'Danışmanı Düzenle' : 'Yeni Danışman Ekle'}
        footer={<>
          <button onClick={() => setModal(null)} className="btn-secondary">İptal</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Ad Soyad<span className="text-red-500">*</span></label>
            <input type="text" className="input-field" value={form.full_name} onChange={set('full_name')} />
          </div>
          {!editId && (
            <div>
              <label className="label">Kullanıcı Adı<span className="text-red-500">*</span></label>
              <input type="text" className="input-field" value={form.username} onChange={set('username')} />
            </div>
          )}
          <div>
            <label className="label">{editId ? 'Yeni Şifre (boş bırakılırsa değişmez)' : 'Şifre*'}</label>
            <input type="password" className="input-field" value={form.password} onChange={set('password')} placeholder={editId ? 'Boş bırakın...' : 'En az 6 karakter'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">E-posta</label>
              <input type="email" className="input-field" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input type="tel" className="input-field" value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div>
            <label className="label">Rol</label>
            <select className="input-field" value={form.role} onChange={set('role')}>
              <option value="agent">Danışman</option>
              <option value="admin">Yönetici</option>
            </select>
          </div>
          {editId && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={set('active')} className="accent-primary-600" />
              <span className="text-sm">Aktif hesap</span>
            </label>
          )}
        </div>
      </Modal>

      <ConfirmModal
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Danışmanı Devre Dışı Bırak"
        message={`${deactivateTarget?.full_name} hesabını devre dışı bırakmak istediğinizden emin misiniz?`}
        confirmText="Devre Dışı Bırak"
      />
    </div>
  )
}
