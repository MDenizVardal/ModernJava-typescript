const router = require('express').Router()
const bcrypt = require('bcryptjs')
const { getDb } = require('../database')
const { authMiddleware, adminOnly } = require('./auth')

router.use(authMiddleware)

// GET /api/agents
router.get('/', (req, res) => {
  const agents = getDb().prepare(`
    SELECT u.id, u.username, u.full_name, u.email, u.phone, u.role, u.active, u.created_at, u.last_login,
    COUNT(p.id) as property_count
    FROM users u LEFT JOIN properties p ON p.listed_by = u.id
    GROUP BY u.id ORDER BY u.full_name
  `).all()
  res.json(agents)
})

// GET /api/agents/:id
router.get('/:id', (req, res) => {
  const agent = getDb().prepare('SELECT id, username, full_name, email, phone, role, active, created_at, last_login FROM users WHERE id = ?').get(req.params.id)
  if (!agent) return res.status(404).json({ error: 'Danışman bulunamadı' })
  res.json(agent)
})

// POST /api/agents
router.post('/', adminOnly, (req, res) => {
  const { username, password, full_name, email, phone, role = 'agent' } = req.body
  if (!username || !password || !full_name)
    return res.status(400).json({ error: 'Kullanıcı adı, şifre ve ad soyad zorunlu' })
  if (password.length < 6)
    return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı' })

  const db = getDb()
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (exists) return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' })

  const result = db.prepare(`
    INSERT INTO users (username, password, full_name, email, phone, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(username, bcrypt.hashSync(password, 10), full_name, email, phone, role)

  const newAgent = db.prepare('SELECT id, username, full_name, email, phone, role, active, created_at FROM users WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(newAgent)
})

// PUT /api/agents/:id
router.put('/:id', adminOnly, (req, res) => {
  const { full_name, email, phone, role, active, password } = req.body
  const db = getDb()
  const agent = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!agent) return res.status(404).json({ error: 'Danışman bulunamadı' })

  if (password && password.length >= 6) {
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(password, 10), req.params.id)
  }

  db.prepare('UPDATE users SET full_name = ?, email = ?, phone = ?, role = ?, active = ? WHERE id = ?')
    .run(full_name, email, phone, role, active ? 1 : 0, req.params.id)

  const updated = db.prepare('SELECT id, username, full_name, email, phone, role, active, created_at, last_login FROM users WHERE id = ?').get(req.params.id)
  res.json(updated)
})

// DELETE /api/agents/:id
router.delete('/:id', adminOnly, (req, res) => {
  const db = getDb()
  if (parseInt(req.params.id) === req.user.id)
    return res.status(400).json({ error: 'Kendi hesabınızı silemezsiniz' })
  const agent = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!agent) return res.status(404).json({ error: 'Danışman bulunamadı' })
  db.prepare('UPDATE users SET active = 0 WHERE id = ?').run(req.params.id)
  res.json({ message: 'Danışman devre dışı bırakıldı' })
})

// GET /api/agents/:id/properties
router.get('/:id/properties', (req, res) => {
  const props = getDb().prepare(`
    SELECT p.*, pi.filename as cover_image FROM properties p
    LEFT JOIN property_images pi ON pi.property_id = p.id AND pi.is_cover = 1
    WHERE p.listed_by = ? ORDER BY p.created_at DESC
  `).all(req.params.id)
  res.json(props)
})

module.exports = router
