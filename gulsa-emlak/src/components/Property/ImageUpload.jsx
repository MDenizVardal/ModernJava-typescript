import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Star } from 'lucide-react'
import { imageUrl } from '../../api/client'

export default function ImageUpload({ existingImages = [], newImages = [], onNewImages, onDeleteExisting, onSetCover, propertyId }) {
  const [lightbox, setLightbox] = useState(null)

  const onDrop = useCallback(acceptedFiles => {
    const readers = acceptedFiles.map(file => new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = (e) => resolve({
        name: file.name,
        data: e.target.result.split(',')[1],
        preview: e.target.result,
        mime: file.type,
      })
      reader.readAsDataURL(file)
    }))
    Promise.all(readers).then(imgs => onNewImages(prev => [...prev, ...imgs]))
  }, [onNewImages])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
  })

  const removeNew = (idx) => onNewImages(prev => prev.filter((_, i) => i !== idx))

  return (
    <div className="space-y-4">
      {/* Mevcut resimler */}
      {existingImages.length > 0 && (
        <div>
          <p className="label">Mevcut Fotoğraflar ({existingImages.length})</p>
          <div className="grid grid-cols-4 gap-2">
            {existingImages.map(img => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-500 transition-colors cursor-pointer"
                style={img.is_cover ? { borderColor: '#c9a227' } : {}}>
                <img
                  src={imageUrl(img.filename)}
                  alt=""
                  className="w-full h-20 object-cover"
                  onClick={() => setLightbox(imageUrl(img.filename))}
                />
                {img.is_cover && (
                  <div className="absolute top-1 left-1 bg-gold-500 rounded-full p-0.5">
                    <Star className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {!img.is_cover && (
                    <button onClick={() => onSetCover?.(img.id)} className="p-1 bg-gold-400 rounded-full" title="Kapak yap">
                      <Star className="w-3 h-3 text-white" />
                    </button>
                  )}
                  <button onClick={() => onDeleteExisting?.(img.id)} className="p-1 bg-red-500 rounded-full" title="Sil">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yeni resimler */}
      {newImages.length > 0 && (
        <div>
          <p className="label">Eklenecek Fotoğraflar ({newImages.length})</p>
          <div className="grid grid-cols-4 gap-2">
            {newImages.map((img, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden">
                <img src={img.preview} alt="" className="w-full h-20 object-cover" />
                <button onClick={() => removeNew(i)}
                  className="absolute top-1 right-1 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {isDragActive ? 'Bırakın...' : 'Fotoğraf sürükleyin veya tıklayın'}
        </p>
        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP · Maks 10 MB</p>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
          <button className="absolute top-4 right-4 text-white hover:text-slate-300" onClick={() => setLightbox(null)}>
            <X className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  )
}
