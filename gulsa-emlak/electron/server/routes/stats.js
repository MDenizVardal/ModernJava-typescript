const router = require('express').Router()
const { getDb } = require('../database')
const { authMiddleware } = require('./auth')

router.use(authMiddleware)

// GET /api/stats/overview
router.get('/overview', (req, res) => {
  const db = getDb()
  const total      = db.prepare("SELECT COUNT(*) as c FROM properties").get()?.c || 0
  const available  = db.prepare("SELECT COUNT(*) as c FROM properties WHERE status='available'").get()?.c || 0
  const sold       = db.prepare("SELECT COUNT(*) as c FROM properties WHERE status='sold'").get()?.c || 0
  const rented     = db.prepare("SELECT COUNT(*) as c FROM properties WHERE status='rented'").get()?.c || 0
  const agents     = db.prepare("SELECT COUNT(*) as c FROM users WHERE active=1").get()?.c || 0
  const images     = db.prepare("SELECT COUNT(*) as c FROM property_images").get()?.c || 0
  const avgPrice   = db.prepare("SELECT AVG(price) as a FROM properties WHERE status='available'").get()?.a || 0
  const totalValue = db.prepare("SELECT SUM(price) as s FROM properties WHERE status='available'").get()?.s || 0

  res.json({ total, available, sold, rented, agents, images, avg_price: avgPrice, total_value: totalValue })
})

// GET /api/stats/by-type
router.get('/by-type', (req, res) => {
  const data = getDb().prepare(`
    SELECT property_type, COUNT(*) as count, AVG(price) as avg_price, SUM(price) as total_value
    FROM properties GROUP BY property_type ORDER BY count DESC
  `).all()
  res.json(data)
})

// GET /api/stats/by-province
router.get('/by-province', (req, res) => {
  const data = getDb().prepare(`
    SELECT province, COUNT(*) as count, AVG(price) as avg_price
    FROM properties GROUP BY province ORDER BY count DESC LIMIT 20
  `).all()
  res.json(data)
})

// GET /api/stats/monthly
router.get('/monthly', (req, res) => {
  const data = getDb().prepare(`
    SELECT strftime('%Y-%m', created_at) as month,
    COUNT(*) as total,
    SUM(CASE WHEN status='sold' THEN 1 ELSE 0 END) as sold,
    SUM(CASE WHEN status='rented' THEN 1 ELSE 0 END) as rented,
    SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) as available
    FROM properties
    WHERE created_at >= date('now', '-12 months')
    GROUP BY month ORDER BY month
  `).all()
  res.json(data)
})

// GET /api/stats/activity
router.get('/activity', (req, res) => {
  const logs = getDb().prepare(`
    SELECT al.*, u.full_name as user_name FROM activity_logs al
    LEFT JOIN users u ON u.id = al.user_id
    ORDER BY al.created_at DESC LIMIT 50
  `).all()
  res.json(logs)
})

// GET /api/stats/agents
router.get('/agents', (req, res) => {
  const data = getDb().prepare(`
    SELECT u.id, u.full_name,
    COUNT(p.id) as total,
    SUM(CASE WHEN p.status='available' THEN 1 ELSE 0 END) as available,
    SUM(CASE WHEN p.status='sold' THEN 1 ELSE 0 END) as sold,
    SUM(CASE WHEN p.status='rented' THEN 1 ELSE 0 END) as rented
    FROM users u LEFT JOIN properties p ON p.listed_by = u.id
    WHERE u.active = 1
    GROUP BY u.id ORDER BY total DESC
  `).all()
  res.json(data)
})

module.exports = router
