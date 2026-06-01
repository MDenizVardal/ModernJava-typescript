import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, X, MapPin } from 'lucide-react'
import api from '../api/client'
import PropertyMap from '../components/Map/PropertyMap'
import Badge from '../components/UI/Badge'
import { PROPERTY_TYPES, PROPERTY_STATUS, formatPrice, getTypeLabel, getStatusInfo } from '../data/propertyTypes'
import { PROVINCE_NAMES } from '../data/turkey'
import { FullPageLoader } from '../components/UI/LoadingSpinner'

const STATUS_COLORS = { available: 'green', sold: 'blue', rented: 'purple', reserved: 'amber' }

export default function MapView() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)
  const [flyTo, setFlyTo]           = useState(null)
  const [filters, setFilters]       = useState({ province:'', status:'', property_type:'' })
  const navigate = useNavigate()

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = { limit: 500, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) }
      const { data } = await api.get('/properties', { params })
      setProperties(data.data.filter(p => p.latitude && p.longitude))
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchProperties() }, [filters])

  const handleMarkerClick = (p) => {
    setSelected(p)
    if (p.latitude && p.longitude) setFlyTo([p.latitude, p.longitude])
  }

  const withCoords = properties.filter(p => p.latitude && p.longitude)
  const noCoords   = properties.filter(p => !p.latitude || !p.longitude)

  return (
    <div className="flex gap-5 h-[calc(100vh-140px)]">
      {/* Sol panel */}
      <div className="w-80 flex flex-col gap-3 flex-shrink-0">
        {/* Filtreler */}
        <div className="card p-4 space-y-3">
          <h2 className="section-title text-base">Filtrele</h2>
          <select className="input-field text-sm" value={filters.province} onChange={e => setFilters(f => ({ ...f, province: e.target.value }))}>
            <option value="">Tüm İller</option>
            {PROVINCE_NAMES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="input-field text-sm" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">Tüm Durumlar</option>
            {PROPERTY_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="input-field text-sm" value={filters.property_type} onChange={e => setFilters(f => ({ ...f, property_type: e.target.value }))}>
            <option value="">Tüm Türler</option>
            {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {(filters.province || filters.status || filters.property_type) && (
            <button onClick={() => setFilters({ province:'', status:'', property_type:'' })} className="btn-ghost text-sm w-full justify-center">
              <X className="w-3.5 h-3.5" />Filtreyi Temizle
            </button>
          )}
          <p className="text-xs text-slate-400 text-center">{withCoords.length} konumlu ilan gösteriliyor</p>
        </div>

        {/* Seçili ilan */}
        {selected && (
          <div className="card p-4 animate-slide-in">
            <div className="flex items-start justify-between mb-2">
              <Badge color={STATUS_COLORS[selected.status]}>{getStatusInfo(selected.status).label}</Badge>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{selected.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3" />{selected.province}{selected.district ? ` · ${selected.district}` : ''}
            </p>
            <p className="font-bold text-primary-600 dark:text-primary-400 mb-1">{formatPrice(selected.price, selected.currency)}</p>
            {selected.area_sqm && <p className="text-xs text-slate-400">{selected.area_sqm} m²{selected.rooms ? ` · ${selected.rooms}` : ''}</p>}
            <button onClick={() => navigate(`/properties/${selected.id}`)} className="btn-primary w-full justify-center mt-3 text-sm">
              Detayı Gör
            </button>
          </div>
        )}

        {/* Konumsuz ilanlar */}
        {noCoords.length > 0 && (
          <div className="card p-3 text-xs text-slate-400 flex-shrink-0">
            <p>{noCoords.length} ilan haritada gösterilemiyor (koordinat eksik)</p>
          </div>
        )}
      </div>

      {/* Harita */}
      <div className="flex-1 card overflow-hidden">
        {loading ? <FullPageLoader text="Harita yükleniyor..." /> : (
          <PropertyMap
            properties={withCoords}
            flyTo={flyTo}
            onMarkerClick={handleMarkerClick}
            height="100%"
          />
        )}
      </div>
    </div>
  )
}
