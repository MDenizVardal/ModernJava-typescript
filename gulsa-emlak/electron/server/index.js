const express = require('express')
const http = require('http')
const cors = require('cors')
const path = require('path')
const { initDatabase, getImagesDir } = require('./database')
const { initSocket } = require('./socket')

const authRoutes       = require('./routes/auth')
const propertyRoutes   = require('./routes/properties')
const imageRoutes      = require('./routes/images')
const agentRoutes      = require('./routes/agents')
const statsRoutes      = require('./routes/stats')

const PORT = process.env.SERVER_PORT || 3001

async function createServer() {
  await initDatabase()

  const app = express()
  const httpServer = http.createServer(app)
  initSocket(httpServer)

  app.use(cors({ origin: '*' }))
  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ extended: true, limit: '50mb' }))

  // Statik resim servisi
  app.use('/images', express.static(getImagesDir()))

  // API rotaları
  app.use('/api/auth',       authRoutes)
  app.use('/api/properties', propertyRoutes)
  app.use('/api/images',     imageRoutes)
  app.use('/api/agents',     agentRoutes)
  app.use('/api/stats',      statsRoutes)

  app.get('/api/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }))

  // Production: serve the built React app from Express so the renderer
  // uses http://localhost:3001 (avoids file:// CORS and CSP issues)
  const { app: electronApp } = require('electron')
  if (electronApp.isPackaged) {
    const distPath = path.join(__dirname, '../../dist')
    app.use(express.static(distPath))
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api') && !req.path.startsWith('/images')) {
        res.sendFile(path.join(distPath, 'index.html'))
      }
    })
  }

  return new Promise((resolve, reject) => {
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] http://0.0.0.0:${PORT}`)
      resolve(httpServer)
    })
    httpServer.on('error', reject)
  })
}

module.exports = { createServer }
