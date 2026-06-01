import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ExternalLink, ChevronLeft, ChevronRight, Images } from 'lucide-react'
import api, { imageUrl } from '../api/client'
import { FullPageLoader } from '../components/UI/LoadingSpinner'
import { useSocket } from '../context/SocketContext'

export default function Gallery() {
  const [images, setImages]   = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)
  const navigate = useNavigate()
  const { on } = useSocket()
  const LIMIT = 60

  const fetchImages = async (p = 1) => {
    setLoading(p === 1)
    try {
      const { data } = await api.get('/images/all', { params: { page: p, limit: LIMIT } })
      setImages(prev => p === 1 ? data.data : [...prev, ...data.data])
      setTotal(data.total)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchImages(1) }, [])
  useEffect(() => {
    const unsubs = [
      on('images:added',   () => fetchImages(1)),
      on('images:deleted', () => fetchImages(1)),
    ]
    return () => unsubs.forEach(u => u())
  }, [on])

  const lbIdx = lightbox !== null ? lightbox : 0
  const prev = () => setLightbox(i => (i - 1 + images.length) % images.length)
  const next = () => setLightbox(i => (i + 1) % images.length)

  if (loading) return <FullPageLoader text="Galeri yükleniyor..." />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 dark:text-slate-400 text-sm">{total} fotoğraf</p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Images className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Henüz fotoğraf yok</p>
          <p className="text-sm">İlanlara fotoğraf ekleyince burada görünür</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {images.map((img, i) => (
              <div key={img.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                onClick={() => setLightbox(i)}
              >
                <img src={imageUrl(img.filename)} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-1.5 opacity-0 group-hover:opacity-100">
                  <p className="text-white text-xs truncate">{img.property_title}</p>
                </div>
              </div>
            ))}
          </div>

          {images.length < total && (
            <div className="text-center">
              <button onClick={() => { const next = page + 1; setPage(next); fetchImages(next) }} className="btn-secondary mx-auto">
                Daha Fazla Yükle ({images.length}/{total})
              </button>
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={() => setLightbox(null)}>
          <div className="flex items-center justify-between px-4 py-3" onClick={e => e.stopPropagation()}>
            <p className="text-white text-sm font-medium">{images[lbIdx]?.property_title}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(`/properties/${images[lbIdx]?.property_id}`)} className="text-slate-300 hover:text-white flex items-center gap-1 text-sm">
                <ExternalLink className="w-4 h-4" />İlana git
              </button>
              <button onClick={() => setLightbox(null)} className="text-slate-300 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 relative" onClick={e => e.stopPropagation()}>
            <img src={imageUrl(images[lbIdx]?.filename)} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
            {images.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-sm">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-sm">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
          <p className="text-center text-slate-400 text-sm pb-3">{lbIdx + 1} / {images.length}</p>
        </div>
      )}
    </div>
  )
}
