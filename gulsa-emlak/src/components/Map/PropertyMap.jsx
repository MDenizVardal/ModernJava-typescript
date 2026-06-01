import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '../../data/propertyTypes'

// Özel marker ikonu
const createIcon = (color = '#1e3a5f') => L.divIcon({
  html: `<div style="width:28px;height:36px;position:relative">
    <svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9 14 22 14 22S28 23 28 14C28 6.268 21.732 0 14 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>
  </div>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -38],
  className: '',
})

const STATUS_COLORS = {
  available: '#22c55e',
  sold:      '#3b82f6',
  rented:    '#a855f7',
  reserved:  '#f59e0b',
}

function FlyTo({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 12, { duration: 1 })
  }, [center, map])
  return null
}

export default function PropertyMap({ properties = [], flyTo = null, onMarkerClick, height = '100%' }) {
  const navigate = useNavigate()

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden">
      <MapContainer
        center={[39.0, 35.0]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {flyTo && <FlyTo center={flyTo} />}
        {properties.filter(p => p.latitude && p.longitude).map(p => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={createIcon(STATUS_COLORS[p.status] || '#1e3a5f')}
            eventHandlers={{ click: () => onMarkerClick?.(p) }}
          >
            <Popup>
              <div className="min-w-[200px]" onClick={() => navigate(`/properties/${p.id}`)} style={{ cursor: 'pointer' }}>
                <p className="font-semibold text-slate-900 text-sm leading-tight">{p.title}</p>
                <p className="text-xs text-slate-500 mt-1">{p.province}{p.district ? ` · ${p.district}` : ''}</p>
                <p className="text-base font-bold text-blue-700 mt-1.5">{formatPrice(p.price, p.currency)}</p>
                {p.area_sqm && <p className="text-xs text-slate-400">{p.area_sqm} m²{p.rooms ? ` · ${p.rooms}` : ''}</p>}
                <p className="text-xs text-blue-500 mt-2 underline">Detayı gör →</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export function LocationPicker({ value, onChange }) {
  const mapRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) return
    const map = L.map(mapRef.current, {
      center: value ? [value.lat, value.lng] : [39.0, 35.0],
      zoom: value ? 13 : 6,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

    let marker = null
    if (value) marker = L.marker([value.lat, value.lng], { icon: createIcon() }).addTo(map)

    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      if (marker) marker.setLatLng([lat, lng])
      else marker = L.marker([lat, lng], { icon: createIcon() }).addTo(map)
      onChange({ lat, lng })
    })

    return () => map.remove()
  }, [])

  return <div ref={mapRef} style={{ height: 280 }} className="rounded-xl border border-slate-200 dark:border-slate-600" />
}
