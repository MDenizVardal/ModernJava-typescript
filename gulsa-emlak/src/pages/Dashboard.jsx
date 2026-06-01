import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, CheckCircle, XCircle, Clock, Users, Image, TrendingUp, Plus, Eye } from 'lucide-react'
import api, { imageUrl } from '../api/client'
import StatCard from '../components/UI/StatCard'
import Badge from '../components/UI/Badge'
import { FullPageLoader } from '../components/UI/LoadingSpinner'
import { formatPrice, getStatusInfo } from '../data/propertyTypes'
import { useSocket } from '../context/SocketContext'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

const STATUS_COLORS = { available: 'green', sold: 'blue', rented: 'purple', reserved: 'amber' }

export default function Dashboard() {
  const [stats, setStats]         = useState(null)
  const [recent, setRecent]       = useState([])
  const [activity, setActivity]   = useState([])
  const [loading, setLoading]     = useState(true)
  const navigate = useNavigate()
  const { on } = useSocket()

  const fetchAll = async () => {
    try {
      const [s, p, a] = await Promise.all([
        api.get('/stats/overview'),
        api.get('/properties?limit=6'),
        api.get('/stats/activity'),
      ])
      setStats(s.data)
      setRecent(p.data.data)
      setActivity(a.data.slice(0, 12))
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    const unsubs = [
      on('property:created', () => fetchAll()),
      on('property:updated', () => fetchAll()),
      on('property:deleted', () => fetchAll()),
    ]
    return () => unsubs.forEach(u => u())
  }, [on])

  if (loading) return <FullPageLoader text="Veriler yükleniyor..." />

  return (
    <div className="space-y-6">
      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Toplam İlan"   value={stats?.total || 0}     color="navy"   onClick={() => navigate('/properties')} />
        <StatCard icon={CheckCircle} label="Mevcut"      value={stats?.available || 0}  color="green"  onClick={() => navigate('/properties?status=available')} />
        <StatCard icon={XCircle}    label="Satıldı"      value={stats?.sold || 0}       color="blue"   onClick={() => navigate('/properties?status=sold')} />
        <StatCard icon={Clock}      label="Kiralandı"    value={stats?.rented || 0}     color="purple" onClick={() => navigate('/properties?status=rented')} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}      label="Aktif Danışman" value={stats?.agents || 0}  color="amber" />
        <StatCard icon={Image}      label="Toplam Fotoğraf" value={stats?.images || 0} color="gold" />
        <StatCard icon={TrendingUp} label="Ort. Fiyat"
          value={stats?.avg_price ? `${Math.round(stats.avg_price).toLocaleString('tr-TR')} ₺` : '-'} color="red" />
        <StatCard icon={TrendingUp} label="Portföy Değeri"
          value={stats?.total_value ? `${(stats.total_value / 1_000_000).toFixed(1)} M ₺` : '-'} color="navy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Son İlanlar */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Son Eklenen İlanlar</h2>
            <button onClick={() => navigate('/properties')} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Tümünü gör →
            </button>
          </div>
          <div className="space-y-3">
            {recent.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Henüz ilan yok</p>
                <button onClick={() => navigate('/properties/new')} className="btn-primary mt-3 mx-auto text-sm">
                  <Plus className="w-4 h-4" /> İlk ilanı ekle
                </button>
              </div>
            )}
            {recent.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/properties/${p.id}`)}>
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                  {p.cover_image
                    ? <img src={imageUrl(p.cover_image)} alt="" className="w-full h-full object-cover" />
                    : <Eye className="w-6 h-6 text-slate-400 m-auto mt-3.5" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-slate-200 truncate text-sm">{p.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{p.province}{p.district ? ` · ${p.district}` : ''}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-primary-600 dark:text-primary-400 text-sm">{formatPrice(p.price, p.currency)}</p>
                  <Badge color={STATUS_COLORS[p.status]} size="xs">{getStatusInfo(p.status).label}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aktivite Akışı */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Son Aktiviteler</h2>
          <div className="space-y-3 overflow-y-auto max-h-96">
            {activity.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Aktivite yok</p>}
            {activity.map(log => (
              <div key={log.id} className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-snug">{log.details}</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                    {log.user_name} · {format(new Date(log.created_at), 'd MMM HH:mm', { locale: tr })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
