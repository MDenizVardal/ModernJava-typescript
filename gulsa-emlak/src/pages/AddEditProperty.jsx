import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Save, Loader2 } from 'lucide-react'
import api from '../api/client'
import ImageUpload from '../components/Property/ImageUpload'
import { LocationPicker } from '../components/Map/PropertyMap'
import { PROPERTY_TYPES, PROPERTY_STATUS, ROOMS, HEATING_TYPES } from '../data/propertyTypes'
import { PROVINCE_NAMES } from '../data/turkey'
import toast from 'react-hot-toast'

const EMPTY = {
  title:'', description:'', price:'', currency:'TRY', status:'available',
  property_type:'daire', province:'', district:'', address:'',
  latitude:'', longitude:'', area_sqm:'', rooms:'', floor:'',
  total_floors:'', building_age:'', heating:'', furnished:false,
  balcony:false, parking:false, elevator:false,
  contact_name:'', contact_phone:'', notes:'',
}

export default function AddEditProperty() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm]           = useState(EMPTY)
  const [newImages, setNewImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [saving, setSaving]       = useState(false)
  const [loading, setLoading]     = useState(isEdit)
  const [tab, setTab]             = useState(0)

  useEffect(() => {
    if (!isEdit) return
    api.get(`/properties/${id}`).then(r => {
      const p = r.data
      setForm({
        title: p.title || '', description: p.description || '', price: p.price || '',
        currency: p.currency || 'TRY', status: p.status || 'available',
        property_type: p.property_type || 'daire', province: p.province || '',
        district: p.district || '', address: p.address || '',
        latitude: p.latitude || '', longitude: p.longitude || '',
        area_sqm: p.area_sqm || '', rooms: p.rooms || '',
        floor: p.floor ?? '', total_floors: p.total_floors || '',
        building_age: p.building_age || '', heating: p.heating || '',
        furnished: Boolean(p.furnished), balcony: Boolean(p.balcony),
        parking: Boolean(p.parking), elevator: Boolean(p.elevator),
        contact_name: p.contact_name || '', contact_phone: p.contact_phone || '', notes: p.notes || '',
      })
      setExistingImages(p.images || [])
      setLoading(false)
    }).catch(() => { toast.error('İlan bulunamadı'); navigate('/properties') })
  }, [id])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const setCoords = ({ lat, lng }) => setForm(f => ({ ...f, latitude: lat, longitude: lng }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.price || !form.province || !form.property_type) {
      toast.error('Başlık, fiyat, il ve emlak türü zorunlu')
      return
    }
    setSaving(true)
    try {
      let prop
      if (isEdit) {
        const { data } = await api.put(`/properties/${id}`, form)
        prop = data
      } else {
        const { data } = await api.post('/properties', form)
        prop = data
      }
      if (newImages.length > 0) {
        await api.post('/images/upload', { property_id: prop.id, images: newImages })
      }
      toast.success(isEdit ? 'İlan güncellendi' : 'İlan eklendi')
      navigate(`/properties/${prop.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Kayıt başarısız')
    }
    setSaving(false)
  }

  const handleDeleteImage = async (imgId) => {
    await api.delete(`/images/${imgId}`)
    setExistingImages(imgs => imgs.filter(i => i.id !== imgId))
    toast.success('Resim silindi')
  }

  const handleSetCover = async (imgId) => {
    await api.put(`/images/${imgId}/cover`)
    setExistingImages(imgs => imgs.map(i => ({ ...i, is_cover: i.id === imgId ? 1 : 0 })))
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>

  const TABS = ['Temel Bilgiler', 'Detaylar', 'Fotoğraflar', 'Konum']

  const Field = ({ label, req, children }) => (
    <div>
      <label className="label">{label}{req && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-5">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost"><ChevronLeft className="w-4 h-4" /></button>
          <h1 className="page-title">{isEdit ? 'İlanı Düzenle' : 'Yeni İlan Ekle'}</h1>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Kaydet' : 'İlanı Ekle'}
        </button>
      </div>

      {/* Tab navigasyonu */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {TABS.map((t, i) => (
          <button key={i} type="button" onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === i ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0: Temel */}
      {tab === 0 && (
        <div className="card p-6 space-y-5 animate-fade-in">
          <Field label="İlan Başlığı" req>
            <input type="text" className="input-field" placeholder="Örn: Kadıköy'de 3+1 Satılık Daire" value={form.title} onChange={set('title')} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Emlak Türü" req>
              <select className="input-field" value={form.property_type} onChange={set('property_type')}>
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Durum" req>
              <select className="input-field" value={form.status} onChange={set('status')}>
                {PROPERTY_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Field label="Fiyat" req>
                <input type="number" className="input-field" placeholder="0" value={form.price} onChange={set('price')} min="0" />
              </Field>
            </div>
            <Field label="Para Birimi">
              <select className="input-field" value={form.currency} onChange={set('currency')}>
                <option value="TRY">₺ Türk Lirası</option>
                <option value="USD">$ Dolar</option>
                <option value="EUR">€ Euro</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="İl" req>
              <select className="input-field" value={form.province} onChange={set('province')}>
                <option value="">İl seçin</option>
                {PROVINCE_NAMES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="İlçe">
              <input type="text" className="input-field" placeholder="İlçe adı" value={form.district} onChange={set('district')} />
            </Field>
          </div>
          <Field label="Açık Adres">
            <input type="text" className="input-field" placeholder="Mahalle, Cadde, Sokak..." value={form.address} onChange={set('address')} />
          </Field>
          <Field label="Açıklama">
            <textarea className="input-field resize-none" rows={4} placeholder="İlan açıklaması..." value={form.description} onChange={set('description')} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Yetkili Adı">
              <input type="text" className="input-field" value={form.contact_name} onChange={set('contact_name')} />
            </Field>
            <Field label="Yetkili Telefon">
              <input type="tel" className="input-field" value={form.contact_phone} onChange={set('contact_phone')} />
            </Field>
          </div>
        </div>
      )}

      {/* Tab 1: Detaylar */}
      {tab === 1 && (
        <div className="card p-6 space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Alan (m²)">
              <input type="number" className="input-field" value={form.area_sqm} onChange={set('area_sqm')} min="0" />
            </Field>
            <Field label="Oda Sayısı">
              <select className="input-field" value={form.rooms} onChange={set('rooms')}>
                <option value="">Seçin</option>
                {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Kat">
              <input type="number" className="input-field" value={form.floor} onChange={set('floor')} />
            </Field>
            <Field label="Toplam Kat">
              <input type="number" className="input-field" value={form.total_floors} onChange={set('total_floors')} min="1" />
            </Field>
            <Field label="Bina Yaşı">
              <input type="number" className="input-field" value={form.building_age} onChange={set('building_age')} min="0" />
            </Field>
            <Field label="Isıtma">
              <select className="input-field" value={form.heating} onChange={set('heating')}>
                <option value="">Seçin</option>
                {HEATING_TYPES.map(h => <option key={h.value} value={h.label}>{h.label}</option>)}
              </select>
            </Field>
          </div>
          <div>
            <p className="label mb-2">Özellikler</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { field: 'furnished', label: 'Eşyalı' },
                { field: 'balcony',   label: 'Balkon' },
                { field: 'parking',   label: 'Otopark' },
                { field: 'elevator',  label: 'Asansör' },
              ].map(({ field, label }) => (
                <label key={field} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <input type="checkbox" checked={form[field]} onChange={set(field)} className="w-4 h-4 accent-primary-600" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <Field label="Notlar (İç Kullanım)">
            <textarea className="input-field resize-none" rows={3} placeholder="Danışmana özel notlar..." value={form.notes} onChange={set('notes')} />
          </Field>
        </div>
      )}

      {/* Tab 2: Fotoğraflar */}
      {tab === 2 && (
        <div className="card p-6 animate-fade-in">
          <h3 className="section-title mb-4">Fotoğraf Yönetimi</h3>
          <ImageUpload
            existingImages={existingImages}
            newImages={newImages}
            onNewImages={setNewImages}
            onDeleteExisting={handleDeleteImage}
            onSetCover={handleSetCover}
            propertyId={id}
          />
        </div>
      )}

      {/* Tab 3: Konum */}
      {tab === 3 && (
        <div className="card p-6 animate-fade-in">
          <h3 className="section-title mb-2">Koordinat Seçin</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Haritaya tıklayarak konumu işaretleyin.</p>
          <LocationPicker
            value={form.latitude && form.longitude ? { lat: parseFloat(form.latitude), lng: parseFloat(form.longitude) } : null}
            onChange={setCoords}
          />
          {form.latitude && form.longitude && (
            <p className="text-xs text-slate-400 mt-2">
              Enlem: {parseFloat(form.latitude).toFixed(6)} · Boylam: {parseFloat(form.longitude).toFixed(6)}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Field label="Enlem (manuel)">
              <input type="number" step="any" className="input-field" value={form.latitude} onChange={set('latitude')} placeholder="39.0000" />
            </Field>
            <Field label="Boylam (manuel)">
              <input type="number" step="any" className="input-field" value={form.longitude} onChange={set('longitude')} placeholder="35.0000" />
            </Field>
          </div>
        </div>
      )}
    </form>
  )
}
