const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { getDb, getImagesDir } = require('../database')
const { broadcast } = require('../socket')
const { authMiddleware } = require('./auth')

router.use(authMiddleware)

// POST /api/images/upload
router.post('/upload', (req, res) => {
  const { property_id, images } = req.body
  if (!property_id || !Array.isArray(images) || images.length === 0)
    return res.status(400).json({ error: 'property_id ve images[] zorunlu' })

  const db = getDb()
  const dir = path.join(getImagesDir(), String(property_id))
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const existingCount = db.prepare('SELECT COUNT(*) as cnt FROM property_images WHERE property_id = ?').get(property_id)?.cnt || 0
  const saved = []

  images.forEach((img, i) => {
    const ext = img.name?.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${uuidv4()}.${ext}`
    const filepath = path.join(dir, filename)

    const base64 = img.data.replace(/^data:image\/\w+;base64,/, '')
    fs.writeFileSync(filepath, Buffer.from(base64, 'base64'))

    const isCover = existingCount === 0 && i === 0 ? 1 : 0
    const result = db.prepare(`
      INSERT INTO property_images (property_id, filename, is_cover, sort_order)
      VALUES (?, ?, ?, ?)
    `).run(property_id, `${property_id}/${filename}`, isCover, existingCount + i)

    saved.push({ id: result.lastInsertRowid, property_id, filename: `${property_id}/${filename}`, is_cover: isCover })
  })

  broadcast('images:added', { property_id, images: saved })
  res.status(201).json(saved)
})

// DELETE /api/images/:id
router.delete('/:id', (req, res) => {
  const db = getDb()
  const img = db.prepare('SELECT * FROM property_images WHERE id = ?').get(req.params.id)
  if (!img) return res.status(404).json({ error: 'Resim bulunamadı' })

  const filepath = path.join(getImagesDir(), img.filename)
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath)

  db.prepare('DELETE FROM property_images WHERE id = ?').run(req.params.id)

  // Başka bir resmi kapak yap
  if (img.is_cover) {
    const next = db.prepare('SELECT id FROM property_images WHERE property_id = ? ORDER BY sort_order LIMIT 1').get(img.property_id)
    if (next) db.prepare('UPDATE property_images SET is_cover = 1 WHERE id = ?').run(next.id)
  }

  broadcast('images:deleted', { id: parseInt(req.params.id), property_id: img.property_id })
  res.json({ message: 'Resim silindi' })
})

// PUT /api/images/:id/cover
router.put('/:id/cover', (req, res) => {
  const db = getDb()
  const img = db.prepare('SELECT * FROM property_images WHERE id = ?').get(req.params.id)
  if (!img) return res.status(404).json({ error: 'Resim bulunamadı' })
  db.prepare('UPDATE property_images SET is_cover = 0 WHERE property_id = ?').run(img.property_id)
  db.prepare('UPDATE property_images SET is_cover = 1 WHERE id = ?').run(req.params.id)
  res.json({ message: 'Kapak fotoğrafı güncellendi' })
})

// GET /api/images/property/:propertyId
router.get('/property/:propertyId', (req, res) => {
  const images = getDb().prepare(
    'SELECT * FROM property_images WHERE property_id = ? ORDER BY is_cover DESC, sort_order ASC'
  ).all(req.params.propertyId)
  res.json(images)
})

// GET /api/images/all
router.get('/all', (req, res) => {
  const { page = 1, limit = 50 } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)
  const db = getDb()
  const total = db.prepare('SELECT COUNT(*) as cnt FROM property_images').get()?.cnt || 0
  const images = db.prepare(`
    SELECT pi.*, p.title as property_title
    FROM property_images pi JOIN properties p ON p.id = pi.property_id
    ORDER BY pi.created_at DESC LIMIT ? OFFSET ?
  `).all(parseInt(limit), offset)
  res.json({ data: images, total })
})

module.exports = router
