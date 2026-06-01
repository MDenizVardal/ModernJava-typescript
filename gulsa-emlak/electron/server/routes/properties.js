const router = require('express').Router()
const { getDb } = require('../database')
const { broadcast } = require('../socket')
const { authMiddleware } = require('./auth')

router.use(authMiddleware)

// GET /api/properties
router.get('/', (req, res) => {
  const { search, status, property_type, province, min_price, max_price, rooms, favorites, page = 1, limit = 20 } = req.query
  const db = getDb()
  const offset = (parseInt(page) - 1) * parseInt(limit)
  const conditions = []
  const params = []

  if (search) {
    conditions.push('(p.title LIKE ? OR p.description LIKE ? OR p.address LIKE ? OR p.district LIKE ?)')
    const s = `%${search}%`
    params.push(s, s, s, s)
  }
  if (status)        { conditions.push('p.status = ?');        params.push(status) }
  if (property_type) { conditions.push('p.property_type = ?'); params.push(property_type) }
  if (province)      { conditions.push('p.province = ?');      params.push(province) }
  if (min_price)     { conditions.push('p.price >= ?');        params.push(parseFloat(min_price)) }
  if (max_price)     { conditions.push('p.price <= ?');        params.push(parseFloat(max_price)) }
  if (rooms)         { conditions.push('p.rooms = ?');         params.push(rooms) }

  let joinFav = ''
  if (favorites === 'true') {
    joinFav = `INNER JOIN favorites f ON f.property_id = p.id AND f.user_id = ${req.user.id}`
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const baseQuery = `
    FROM properties p
    LEFT JOIN users u ON u.id = p.listed_by
    LEFT JOIN property_images pi ON pi.property_id = p.id AND pi.is_cover = 1
    ${joinFav}
    ${where}
  `

  const total = db.prepare(`SELECT COUNT(DISTINCT p.id) as cnt ${baseQuery}`).get(...params)?.cnt || 0
  const rows  = db.prepare(`
    SELECT DISTINCT p.*, u.full_name as agent_name, pi.filename as cover_image,
    (SELECT COUNT(*) FROM favorites WHERE property_id = p.id AND user_id = ?) as is_favorite
    ${baseQuery}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.user.id, ...params, parseInt(limit), offset)

  res.json({ data: rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
})

// GET /api/properties/:id
router.get('/:id', (req, res) => {
  const db = getDb()
  db.prepare('UPDATE properties SET views = views + 1 WHERE id = ?').run(req.params.id)
  const prop = db.prepare(`
    SELECT p.*, u.full_name as agent_name,
    (SELECT COUNT(*) FROM favorites WHERE property_id = p.id AND user_id = ?) as is_favorite
    FROM properties p LEFT JOIN users u ON u.id = p.listed_by
    WHERE p.id = ?
  `).get(req.user.id, req.params.id)
  if (!prop) return res.status(404).json({ error: 'İlan bulunamadı' })
  const images = db.prepare('SELECT * FROM property_images WHERE property_id = ? ORDER BY is_cover DESC, sort_order ASC').all(req.params.id)
  res.json({ ...prop, images })
})

// POST /api/properties
router.post('/', (req, res) => {
  const db = getDb()
  const {
    title, description, price, currency = 'TRY', status = 'available', property_type,
    province, district, address, latitude, longitude,
    area_sqm, rooms, floor, total_floors, building_age, heating,
    furnished, balcony, parking, elevator, contact_name, contact_phone, notes
  } = req.body

  if (!title || !price || !property_type || !province)
    return res.status(400).json({ error: 'Başlık, fiyat, il ve emlak türü zorunlu' })

  const result = db.prepare(`
    INSERT INTO properties (
      title, description, price, currency, status, property_type,
      province, district, address, latitude, longitude,
      area_sqm, rooms, floor, total_floors, building_age, heating,
      furnished, balcony, parking, elevator, contact_name, contact_phone, notes, listed_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    title, description, price, currency, status, property_type,
    province, district, address, latitude, longitude,
    area_sqm, rooms, floor, total_floors, building_age, heating,
    furnished ? 1 : 0, balcony ? 1 : 0, parking ? 1 : 0, elevator ? 1 : 0,
    contact_name, contact_phone, notes, req.user.id
  )

  db.prepare(`INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, 'create', 'property', ?, ?)`)
    .run(req.user.id, result.lastInsertRowid, `"${title}" ilanı eklendi`)

  const newProp = db.prepare('SELECT * FROM properties WHERE id = ?').get(result.lastInsertRowid)
  broadcast('property:created', newProp)
  res.status(201).json(newProp)
})

// PUT /api/properties/:id
router.put('/:id', (req, res) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'İlan bulunamadı' })

  const {
    title, description, price, currency, status, property_type,
    province, district, address, latitude, longitude,
    area_sqm, rooms, floor, total_floors, building_age, heating,
    furnished, balcony, parking, elevator, contact_name, contact_phone, notes
  } = req.body

  db.prepare(`
    UPDATE properties SET
      title=?, description=?, price=?, currency=?, status=?, property_type=?,
      province=?, district=?, address=?, latitude=?, longitude=?,
      area_sqm=?, rooms=?, floor=?, total_floors=?, building_age=?, heating=?,
      furnished=?, balcony=?, parking=?, elevator=?, contact_name=?, contact_phone=?,
      notes=?, updated_at=datetime('now','localtime')
    WHERE id=?
  `).run(
    title, description, price, currency, status, property_type,
    province, district, address, latitude, longitude,
    area_sqm, rooms, floor, total_floors, building_age, heating,
    furnished ? 1 : 0, balcony ? 1 : 0, parking ? 1 : 0, elevator ? 1 : 0,
    contact_name, contact_phone, notes, req.params.id
  )

  db.prepare(`INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, 'update', 'property', ?, ?)`)
    .run(req.user.id, req.params.id, `"${title}" ilanı güncellendi`)

  const updated = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id)
  broadcast('property:updated', updated)
  res.json(updated)
})

// DELETE /api/properties/:id
router.delete('/:id', (req, res) => {
  const db = getDb()
  const prop = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id)
  if (!prop) return res.status(404).json({ error: 'İlan bulunamadı' })

  db.prepare('DELETE FROM properties WHERE id = ?').run(req.params.id)
  db.prepare(`INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, 'delete', 'property', ?, ?)`)
    .run(req.user.id, req.params.id, `"${prop.title}" ilanı silindi`)

  broadcast('property:deleted', { id: parseInt(req.params.id) })
  res.json({ message: 'İlan silindi' })
})

// POST /api/properties/:id/favorite
router.post('/:id/favorite', (req, res) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM favorites WHERE user_id = ? AND property_id = ?').get(req.user.id, req.params.id)
  if (existing) {
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND property_id = ?').run(req.user.id, req.params.id)
    res.json({ favorited: false })
  } else {
    db.prepare('INSERT INTO favorites (user_id, property_id) VALUES (?, ?)').run(req.user.id, req.params.id)
    res.json({ favorited: true })
  }
})

module.exports = router
