import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Edit2, Trash2, Heart, MapPin, Maximize2, BedDouble, Building,
  Calendar, Thermometer, Car, ChevronLeft, ChevronRight, X,
  Phone, User, FileText, Eye, Printer
} from 'lucide-react'
import api, { imageUrl } from '../api/client'
import { FullPageLoader } from '../components/UI/LoadingSpinner'
import { ConfirmModal } from '../components/UI/Modal'
import Badge from '../components/UI/Badge'
import PropertyMap from '../components/Map/PropertyMap'
import { formatPrice, getTypeLabel, getStatusInfo } from '../data/propertyTypes'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import jsPDF from 'jspdf'

const STATUS_COLORS = { available: 'green', sold: 'blue', rented: 'purple', reserved: 'amber' }

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [imgIdx, setImgIdx]     = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then(r => { setProperty(r.data); setLoading(false) })
      .catch(() => { toast.error('İlan bulunamadı'); navigate('/properties') })
  }, [id])

  const handleFavorite = async () => {
    const { data } = await api.post(`/properties/${id}/favorite`)
    setProperty(p => ({ ...p, is_favorite: data.favorited ? 1 : 0 }))
  }

  const handleDelete = async () => {
    await api.delete(`/properties/${id}`)
    toast.success('İlan silindi')
    navigate('/properties')
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFont('helvetica')
    doc.setFontSize(18)
    doc.text(property.title, 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`${getTypeLabel(property.property_type)} · ${getStatusInfo(property.status).label}`, 14, 30)
    doc.setTextColor(0)
    doc.setFontSize(14)
    doc.text(`Fiyat: ${formatPrice(property.price, property.currency)}`, 14, 42)
    doc.setFontSize(11)
    let y = 54
    const add = (label, val) => { if (val) { doc.text(`${label}: ${val}`, 14, y); y += 8 } }
    add('İl', property.province)
    add('İlçe', property.district)
    add('Adres', property.address)
    add('Alan', property.area_sqm ? `${property.area_sqm} m²` : '')
    add('Oda Sayısı', property.rooms)
    add('Kat', property.floor != null ? `${property.floor}. Kat` : '')
    add('Toplam Kat', property.total_floors)
    add('Bina Yaşı', property.building_age ? `${property.building_age} yıl` : '')
    add('Isıtma', property.heating)
    add('İletişim', property.contact_name)
    add('Telefon', property.contact_phone)
    if (property.description) { y += 4; doc.text('Açıklama:', 14, y); y += 6; doc.setFontSize(10); doc.text(property.description, 14, y, { maxWidth: 180 }) }
    doc.text(`Gülsa Emlak · ${format(new Date(), 'dd.MM.yyyy')}`, 14, 285)
    doc.save(`${property.title}.pdf`)
    toast.success('PDF indirildi')
  }

  if (loading) return <FullPageLoader />
  if (!property) return null

  const images = property.images || []
  const prev = () => setImgIdx(i => (i - 1 + images.length) % images.length)
  const next = () => setImgIdx(i => (i + 1) % images.length)

  const InfoRow = ({ icon: Icon, label, value }) =>
    value != null && value !== '' ? (
      <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
        <Icon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span className="text-sm text-slate-500 dark:text-slate-400 w-32 flex-shrink-0">{label}</span>
        <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">{value}</span>
      </div>
    ) : null

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Üst bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn-ghost"><ChevronLeft className="w-4 h-4" />Geri</button>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="btn-secondary text-sm"><Printer className="w-4 h-4" />PDF</button>
          <button onClick={handleFavorite} className={`btn-secondary text-sm ${property.is_favorite ? 'text-red-500' : ''}`}>
            <Heart className={`w-4 h-4 ${property.is_favorite ? 'fill-red-500' : ''}`} />
            {property.is_favorite ? 'Favorilerden çıkar' : 'Favorile'}
          </button>
          <button onClick={() => navigate(`/properties/${id}/edit`)} className="btn-primary text-sm">
            <Edit2 className="w-4 h-4" />Düzenle
          </button>
          <button onClick={() => setShowDelete(true)} className="btn-danger text-sm">
            <Trash2 className="w-4 h-4" />Sil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Galeri + bilgiler */}
        <div className="lg:col-span-2 space-y-5">
          {/* Galeri */}
          <div className="card overflow-hidden">
            <div className="relative bg-slate-900 h-72 lg:h-96">
              {images.length > 0 ? (
                <>
                  <img src={imageUrl(images[imgIdx]?.filename)} alt=""
                    className="w-full h-full object-contain cursor-zoom-in"
                    onClick={() => setLightbox(true)} />
                  {images.length > 1 && (
                    <>
                      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button key={i} onClick={() => setImgIdx(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
                        ))}
                      </div>
                      <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        {imgIdx + 1} / {images.length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <Eye className="w-16 h-16 opacity-20 mb-2" />
                  <span>Fotoğraf yok</span>
                </div>
              )}
            </div>
            {/* Küçük resimler */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-primary-500' : 'border-transparent'}`}>
                    <img src={imageUrl(img.filename)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Açıklama */}
          {property.description && (
            <div className="card p-5">
              <h3 className="section-title mb-3">Açıklama</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>
          )}

          {/* Harita */}
          {property.latitude && property.longitude && (
            <div className="card p-5">
              <h3 className="section-title mb-3">Konum</h3>
              <PropertyMap properties={[property]} height="250px" />
            </div>
          )}
        </div>

        {/* Sağ: Detaylar */}
        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <Badge color={STATUS_COLORS[property.status]}>{getStatusInfo(property.status).label}</Badge>
              <Badge color="navy">{getTypeLabel(property.property_type)}</Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">{property.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4">
              <MapPin className="w-4 h-4" />{property.province}{property.district ? ` / ${property.district}` : ''}
              {property.address && ` · ${property.address}`}
            </p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {formatPrice(property.price, property.currency)}
            </p>
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-3">Emlak Bilgileri</h3>
            <InfoRow icon={Maximize2} label="Alan"         value={property.area_sqm ? `${property.area_sqm} m²` : null} />
            <InfoRow icon={BedDouble}  label="Oda Sayısı"  value={property.rooms} />
            <InfoRow icon={Building}   label="Kat"         value={property.floor != null ? `${property.floor}. Kat / ${property.total_floors || '?'} Kat` : null} />
            <InfoRow icon={Calendar}   label="Bina Yaşı"   value={property.building_age != null ? `${property.building_age} yıl` : null} />
            <InfoRow icon={Thermometer} label="Isıtma"     value={property.heating} />
            <div className="flex gap-3 pt-3 flex-wrap">
              {property.furnished ? <Badge color="green">Eşyalı</Badge> : null}
              {property.balcony   ? <Badge color="blue">Balkon</Badge>  : null}
              {property.parking   ? <Badge color="amber">Otopark</Badge>: null}
              {property.elevator  ? <Badge color="purple">Asansör</Badge>: null}
            </div>
          </div>

          {(property.contact_name || property.contact_phone) && (
            <div className="card p-5">
              <h3 className="section-title mb-3">İletişim</h3>
              <InfoRow icon={User}  label="İsim"   value={property.contact_name} />
              <InfoRow icon={Phone} label="Telefon" value={property.contact_phone} />
            </div>
          )}

          {property.notes && (
            <div className="card p-5">
              <h3 className="section-title mb-2 flex items-center gap-2"><FileText className="w-4 h-4" />Notlar</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{property.notes}</p>
            </div>
          )}

          <div className="card p-4 text-xs text-slate-400 space-y-1">
            {property.agent_name && <p>Danışman: <span className="font-medium">{property.agent_name}</span></p>}
            <p>Eklenme: {format(new Date(property.created_at), 'd MMMM yyyy, HH:mm', { locale: tr })}</p>
            {property.views > 0 && <p>{property.views} görüntülenme</p>}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <img src={imageUrl(images[imgIdx]?.filename)} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
          <button className="absolute top-4 right-4 text-white hover:text-slate-300" onClick={() => setLightbox(false)}>
            <X className="w-8 h-8" />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev() }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-slate-300"><ChevronLeft className="w-10 h-10" /></button>
              <button onClick={e => { e.stopPropagation(); next() }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-slate-300"><ChevronRight className="w-10 h-10" /></button>
            </>
          )}
        </div>
      )}

      <ConfirmModal
        open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="İlanı Sil" message={`"${property.title}" ilanını silmek istediğinizden emin misiniz?`} confirmText="Sil"
      />
    </div>
  )
}
