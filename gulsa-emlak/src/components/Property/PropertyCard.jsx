import { useNavigate } from 'react-router-dom'
import { Heart, MapPin, Maximize2, BedDouble, Edit2, Trash2, Eye } from 'lucide-react'
import Badge from '../UI/Badge'
import { imageUrl } from '../../api/client'
import { formatPrice, getTypeLabel, getStatusInfo } from '../../data/propertyTypes'

const STATUS_COLORS = { available: 'green', sold: 'blue', rented: 'purple', reserved: 'amber' }

export default function PropertyCard({ property, onDelete, onFavorite, viewMode = 'grid' }) {
  const navigate = useNavigate()
  const status = getStatusInfo(property.status)
  const coverSrc = imageUrl(property.cover_image)

  if (viewMode === 'list') {
    return (
      <div className="card flex items-center gap-4 p-4 hover:shadow-md transition-shadow cursor-pointer group"
        onClick={() => navigate(`/properties/${property.id}`)}>
        <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-700">
          {coverSrc
            ? <img src={coverSrc} alt={property.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Fotoğraf yok</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{property.title}</h3>
            <Badge color={STATUS_COLORS[property.status]}>{status.label}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{property.province}{property.district ? ` / ${property.district}` : ''}</span>
            {property.area_sqm && <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" />{property.area_sqm} m²</span>}
            {property.rooms && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{property.rooms}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-bold text-primary-600 dark:text-primary-400 text-lg">
            {formatPrice(property.price, property.currency)}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button onClick={() => navigate(`/properties/${property.id}/edit`)} className="btn-ghost p-2"><Edit2 className="w-4 h-4" /></button>
            <button onClick={() => onDelete?.(property)} className="btn-ghost p-2 text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
      onClick={() => navigate(`/properties/${property.id}`)}>
      {/* Fotoğraf */}
      <div className="relative h-48 bg-slate-200 dark:bg-slate-700 overflow-hidden">
        {coverSrc
          ? <img src={coverSrc} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <Eye className="w-8 h-8 opacity-30" />
              <span className="text-xs">Fotoğraf yok</span>
            </div>
        }
        <div className="absolute top-3 left-3">
          <Badge color={STATUS_COLORS[property.status]}>{status.label}</Badge>
        </div>
        <button
          className="absolute top-3 right-3 w-7 h-7 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
          onClick={e => { e.stopPropagation(); onFavorite?.(property) }}
        >
          <Heart className={`w-4 h-4 ${property.is_favorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
        </button>
        <div className="absolute bottom-3 left-3">
          <Badge color="navy" size="xs">{getTypeLabel(property.property_type)}</Badge>
        </div>
      </div>
      {/* İçerik */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate mb-1">{property.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          {property.province}{property.district ? ` · ${property.district}` : ''}
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
          {property.area_sqm && <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" />{property.area_sqm} m²</span>}
          {property.rooms && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{property.rooms}</span>}
          {property.floor != null && <span>{property.floor}. Kat</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary-600 dark:text-primary-400">
            {formatPrice(property.price, property.currency)}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button onClick={() => navigate(`/properties/${property.id}/edit`)} className="btn-ghost p-1.5"><Edit2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => onDelete?.(property)} className="btn-ghost p-1.5 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        {property.agent_name && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
            Danışman: {property.agent_name}
          </p>
        )}
      </div>
    </div>
  )
}
