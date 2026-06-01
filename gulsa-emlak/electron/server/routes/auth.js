const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDb } = require('../database')

const JWT_SECRET = process.env.JWT_SECRET || 'gulsa-emlak-secret-key-2024'
const JWT_EXPIRES = '8h'

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Yetkisiz erişim' })
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' })
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Bu işlem için admin yetkisi gerekli' })
  next()
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' })

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(username)
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' })

  db.prepare("UPDATE users SET last_login = datetime('now','localtime') WHERE id = ?").run(user.id)
  db.prepare(`INSERT INTO activity_logs (user_id, action, entity_type, details) VALUES (?, 'login', 'user', ?)`)
    .run(user.id, `${user.full_name} giriş yaptı`)

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  )

  res.json({
    token,
    user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role, email: user.email, phone: user.phone }
  })
})

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const user = getDb().prepare('SELECT id, username, full_name, role, email, phone, created_at, last_login FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' })
  res.json(user)
})

// PUT /api/auth/change-password
router.put('/change-password', authMiddleware, (req, res) => {
  const { current_password, new_password } = req.body
  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!bcrypt.compareSync(current_password, user.password))
    return res.status(400).json({ error: 'Mevcut şifre hatalı' })
  if (new_password.length < 6)
    return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalı' })
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(new_password, 10), req.user.id)
  res.json({ message: 'Şifre başarıyla değiştirildi' })
})

// PUT /api/auth/profile
router.put('/profile', authMiddleware, (req, res) => {
  const { full_name, email, phone } = req.body
  getDb().prepare('UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?')
    .run(full_name, email, phone, req.user.id)
  res.json({ message: 'Profil güncellendi' })
})

module.exports = router
module.exports.authMiddleware = authMiddleware
module.exports.adminOnly = adminOnly
