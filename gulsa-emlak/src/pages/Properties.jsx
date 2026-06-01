import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, Grid3X3, List, Filter, X } from 'lucide-react'
import api from '../api/client'
import PropertyCard from '../components/Property/PropertyCard'
import { FullPageLoader } from '../components/UI/LoadingSpinner'
import { ConfirmModal } from '../components/UI/Modal'
import { PROPERTY_TYPES, PROPERTY_STATUS } from '../data/propertyTypes'
import { PROVINCE_NAMES as PROVINCE_LIST } from '../data/turkey'
import toast from 'react-hot-toast'
import { useSocket } from '../context/SocketContext'

export default function Properties() {
  const [properties, setProperties] = useState([])
  const [total, setTotal]           = useState(0)
  const [pages, setPages]           = useState(1)
  const [loading, setLoading]       = useState(true)
  const [viewMode, setViewMode]     = useState('grid')
  const [showFilter, setShowFilter] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { on } = useSocket()

  const [filters, setFilters] = useState({
    search:        searchParams.get('search')        || '',
    status:        searchParams.get('status')        || '',
    property_type: searchParams.get('property_type') || '',
    province:      searchParams.get('province')      || '',
    min_price:     searchParams.get('min_price')     || '',
    max_price:     searchParams.get('max_price')     || '',
    rooms:         searchParams.get('rooms')         || '',
    favorites:     searchParams.get('favorites')     || '',
    page:          parseInt(searchParams.get('page') || '1'),
  })

  const fetchProperties = useCallback(async (f = filters) => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '' && v !== false))
    try {
      const { data } = await api.get('/properties', { params })
      setProperties(data.data)
      setTotal(data.total)
      setPages(data.pages)
    } catch { toast.error('İlanlar yüklenemedi') }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProperties(filters) }, [filters.page])

  useEffect(() => {
    const unsubs = [
      on('property:created', () => fetchProperties(filters)),
      on('property:updated', () => fetchProperties(filters)),
      on('property:deleted', () => fetchProperties(filters)),
    ]
    return () => unsubs.forEach(u => u())
  }, [on, filters])

  const applyFilters = () => { setFilters(f => ({ ...f, page: 1 })); fetchProperties({ ...filters, page: 1 }) }
  const clearFilters = () => {
    const cleared = { search:'', status:'', property_type:'', province:'', min_price:'', max_price:'', rooms:'', favorites:'', page:1 }
    setFilters(cleared)
    fetchProperties(cleared)
  }
  const activeFilterCount = [filters.status, filters.property_type, filters.province, filters.min_price, filters.max_price, filters.rooms, filters.favorites].filter(Boolean).length

  const handleDelete = async (prop) => {
    try {
      await api.delete(`/properties/${prop.id}`)
      toast.success('İlan silindi')
      fetchProperties(filters)
    } catch { toast.error('İlan silinemedi') }
  }

  const handleFavorite = async (prop) => {
    try {
      const { data } = await api.post(`/properties/${prop.id}/favorite`)
      setProperties(ps => ps.map(p => p.id === prop.id ? { ...p, is_favorite: data.favorited ? 1 : 0 } : p))
    } catch {}
  }

  return (
    <div className="space-y-5">
      {/* Araç çubuğu */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="İlan ara..." className="input-field pl-9 pr-4"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
          />
        </div>
        <button onClick={() => setShowFilter(s => !s)} className={`btn-secondary relative ${showFilter ? 'ring-2 ring-primary-500' : ''}`}>
          <Filter className="w-4 h-4" />
          Filtre
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        {activeFilterCount > 0 && <button onClick={clearFilters} className="btn-ghost text-sm"><X className="w-4 h-4" />Temizle</button>}
        <button onClick={() => setFilters(f => ({ ...f, favorites: f.favorites ? '' : 'true', page: 1 }))}
          className={`btn-secondary ${filters.favorites ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : ''}`}>
          Favoriler
        </button>
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode==='grid' ? 'bg-primary-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500'}`}><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode==='list' ? 'bg-primary-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500'}`}><List className="w-4 h-4" /></button>
        </div>
        <button onClick={() => navigate('/properties/new')} className="btn-primary">
          <Plus className="w-4 h-4" />Yeni İlan
        </button>
      </div>

      {/* Filtre paneli */}
      {showFilter && (
        <div className="card p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 animate-slide-in">
          <select className="input-field" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">Tüm Durumlar</option>
            {PROPERTY_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="input-field" value={filters.property_type} onChange={e => setFilters(f => ({ ...f, property_type: e.target.value }))}>
            <option value="">Tüm Türler</option>
            {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select className="input-field" value={filters.province} onChange={e => setFilters(f => ({ ...f, province: e.target.value }))}>
            <option value="">Tüm İller</option>
            {PROVINCE_LIST.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input type="number" className="input-field" placeholder="Min fiyat" value={filters.min_price} onChange={e => setFilters(f => ({ ...f, min_price: e.target.value }))} />
          <input type="number" className="input-field" placeholder="Max fiyat" value={filters.max_price} onChange={e => setFilters(f => ({ ...f, max_price: e.target.value }))} />
          <select className="input-field" value={filters.rooms} onChange={e => setFilters(f => ({ ...f, rooms: e.target.value }))}>
            <option value="">Oda Sayısı</option>
            {['1+0','1+1','2+1','3+1','4+1','5+1','6+1'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={applyFilters} className="btn-primary justify-center">Uygula</button>
        </div>
      )}

      {/* Sonuç sayısı */}
      <p className="text-sm text-slate-500 dark:text-slate-400">{total} ilan bulundu</p>

      {/* İlan listesi */}
      {loading ? <FullPageLoader text="İlanlar yükleniyor..." /> : (
        <>
          {properties.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">İlan bulunamadı</p>
              <p className="text-sm mt-1">Filtreleri değiştirmeyi deneyin</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {properties.map(p => (
                <PropertyCard key={p.id} property={p} viewMode="grid"
                  onDelete={setDeleteTarget} onFavorite={handleFavorite} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {properties.map(p => (
                <PropertyCard key={p.id} property={p} viewMode="list"
                  onDelete={setDeleteTarget} onFavorite={handleFavorite} />
              ))}
            </div>
          )}

          {/* Sayfalama */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(pages)].map((_, i) => (
                <button key={i} onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                    ${filters.page === i + 1 ? 'bg-primary-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget)}
        title="İlanı Sil"
        message={`"${deleteTarget?.title}" ilanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
      />
    </div>
  )
}
