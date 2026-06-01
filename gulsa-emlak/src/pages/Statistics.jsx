import { useEffect, useState } from 'react'
import { Building2, TrendingUp, Users, BarChart3 } from 'lucide-react'
import api from '../api/client'
import StatCard from '../components/UI/StatCard'
import { FullPageLoader } from '../components/UI/LoadingSpinner'
import { formatPrice } from '../data/propertyTypes'

export default function Statistics() {
  const [overview, setOverview]     = useState(null)
  const [byType, setByType]         = useState([])
  const [byProvince, setByProvince] = useState([])
  const [monthly, setMonthly]       = useState([])
  const [agentStats, setAgentStats] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/stats/overview'),
      api.get('/stats/by-type'),
      api.get('/stats/by-province'),
      api.get('/stats/monthly'),
      api.get('/stats/agents'),
    ]).then(([o, t, p, m, a]) => {
      setOverview(o.data)
      setByType(t.data)
      setByProvince(p.data)
      setMonthly(m.data)
      setAgentStats(a.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <FullPageLoader text="İstatistikler yükleniyor..." />

  const maxTypeCount = Math.max(...byType.map(t => t.count), 1)
  const maxProvinceCount = Math.max(...byProvince.map(p => p.count), 1)
  const maxMonthly = Math.max(...monthly.map(m => m.total), 1)

  return (
    <div className="space-y-6">
      {/* Genel kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2}  label="Toplam İlan"   value={overview?.total || 0}     color="navy" />
        <StatCard icon={TrendingUp} label="Portföy Değeri"
          value={overview?.total_value ? `${(overview.total_value / 1_000_000).toFixed(1)}M ₺` : '0 ₺'} color="gold" />
        <StatCard icon={BarChart3}  label="Ortalama Fiyat"
          value={overview?.avg_price ? `${Math.round(overview.avg_price).toLocaleString('tr-TR')} ₺` : '0 ₺'} color="green" />
        <StatCard icon={Users}      label="Aktif Danışman" value={overview?.agents || 0}   color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Türe göre */}
        <div className="card p-5">
          <h2 className="section-title mb-5">Emlak Türüne Göre</h2>
          <div className="space-y-3">
            {byType.map(t => (
              <div key={t.property_type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 dark:text-slate-300 font-medium capitalize">{t.property_type}</span>
                  <span className="text-slate-500 dark:text-slate-400">{t.count} ilan</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-700"
                    style={{ width: `${(t.count / maxTypeCount) * 100}%` }} />
                </div>
                {t.avg_price && <p className="text-xs text-slate-400 mt-0.5">Ort. {formatPrice(t.avg_price)}</p>}
              </div>
            ))}
            {byType.length === 0 && <p className="text-slate-400 text-center py-4">Veri yok</p>}
          </div>
        </div>

        {/* İle göre */}
        <div className="card p-5">
          <h2 className="section-title mb-5">İle Göre (Top 15)</h2>
          <div className="space-y-2.5">
            {byProvince.slice(0, 15).map(p => (
              <div key={p.province}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 dark:text-slate-300">{p.province}</span>
                  <span className="text-slate-500 dark:text-slate-400">{p.count}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full transition-all duration-700"
                    style={{ width: `${(p.count / maxProvinceCount) * 100}%` }} />
                </div>
              </div>
            ))}
            {byProvince.length === 0 && <p className="text-slate-400 text-center py-4">Veri yok</p>}
          </div>
        </div>

        {/* Aylık trend */}
        <div className="card p-5">
          <h2 className="section-title mb-5">Aylık Eklenen İlan</h2>
          {monthly.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Veri yok</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {monthly.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: `${(m.total / maxMonthly) * 120}px` }}>
                    {m.sold > 0 && <div className="bg-blue-400 w-full rounded-t-sm" style={{ height: `${(m.sold / m.total) * 100}%` }} />}
                    {m.rented > 0 && <div className="bg-purple-400 w-full" style={{ height: `${(m.rented / m.total) * 100}%` }} />}
                    {m.available > 0 && <div className="bg-green-400 w-full rounded-b-sm" style={{ height: `${(m.available / m.total) * 100}%` }} />}
                  </div>
                  <span className="text-xs text-slate-400">{m.month?.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-4 mt-3 justify-center text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-400" />Mevcut</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />Satıldı</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-400" />Kiralandı</span>
          </div>
        </div>

        {/* Danışman performansı */}
        <div className="card p-5">
          <h2 className="section-title mb-5">Danışman Performansı</h2>
          <div className="space-y-3">
            {agentStats.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-400 w-5">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{a.full_name?.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{a.full_name}</p>
                  <div className="flex gap-2 text-xs text-slate-400">
                    <span>{a.total} ilan</span>
                    {a.sold > 0 && <span className="text-blue-500">{a.sold} satış</span>}
                    {a.rented > 0 && <span className="text-purple-500">{a.rented} kiralama</span>}
                  </div>
                </div>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{a.total}</span>
              </div>
            ))}
            {agentStats.length === 0 && <p className="text-slate-400 text-center py-4">Veri yok</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
