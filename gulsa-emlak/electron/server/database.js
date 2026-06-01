const path = require('path')
const fs = require('fs')
const bcrypt = require('bcryptjs')
const { app } = require('electron')

let db = null
let dbPath = null
let saveTimer = null

function getDbPath() {
  const dataDir = app.getPath('userData')
  return path.join(dataDir, 'gulsa_emlak.db')
}

function getImagesDir() {
  const dir = path.join(app.getPath('userData'), 'images')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

// Debounced save — coalesce rapid writes into one disk write
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      const data = db.export()
      fs.writeFileSync(dbPath, Buffer.from(data))
    } catch (err) {
      console.error('[DB] Save error:', err.message)
    }
  }, 500)
}

function wrapDb(rawDb) {
  const methods = {
    prepare: (sql) => {
      const stmt = rawDb.prepare(sql)
      return {
        run: (...args) => {
          const params = args.flat()
          stmt.run(params)
          stmt.free()
          // Query last insert rowid and changes via a fresh statement
          const idRes = rawDb.exec('SELECT last_insert_rowid()')
          const id = idRes[0]?.values[0][0] ?? 0
          scheduleSave()
          return { lastInsertRowid: id }
        },
        get: (...args) => {
          const params = args.flat()
          stmt.bind(params)
          if (stmt.step()) {
            const cols = stmt.getColumnNames()
            const vals = stmt.get()
            const row = {}
            cols.forEach((c, i) => { row[c] = vals[i] })
            stmt.free()
            return row
          }
          stmt.free()
          return undefined
        },
        all: (...args) => {
          const params = args.flat()
          const rows = []
          stmt.bind(params)
          while (stmt.step()) {
            const cols = stmt.getColumnNames()
            const vals = stmt.get()
            const row = {}
            cols.forEach((c, i) => { row[c] = vals[i] })
            rows.push(row)
          }
          stmt.free()
          return rows
        },
      }
    },
    exec: (sql) => {
      // sql.js run() handles multiple statements separated by semicolons via exec()
      rawDb.exec(sql)
      scheduleSave()
    },
    pragma: (sql) => {
      rawDb.run(`PRAGMA ${sql}`)
    },
  }
  return methods
}

async function initDatabase() {
  const initSqlJs = require('sql.js')
  // In a packaged app the WASM lives next to the unpacked sql.js module.
  // Provide an explicit locateFile so it's found regardless of working dir.
  const wasmDir = path.dirname(require.resolve('sql.js/dist/sql-wasm.js'))
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(wasmDir, file),
  })

  dbPath = getDbPath()
  let rawDb

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    rawDb = new SQL.Database(fileBuffer)
    console.log(`[DB] Mevcut veritabanı yüklendi: ${dbPath}`)
  } else {
    rawDb = new SQL.Database()
    console.log(`[DB] Yeni veritabanı oluşturuldu: ${dbPath}`)
  }

  db = wrapDb(rawDb)
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      username  TEXT UNIQUE NOT NULL,
      password  TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email     TEXT,
      phone     TEXT,
      role      TEXT NOT NULL DEFAULT 'agent',
      active    INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      last_login TEXT
    );

    CREATE TABLE IF NOT EXISTS properties (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      title         TEXT NOT NULL,
      description   TEXT,
      price         REAL NOT NULL,
      currency      TEXT NOT NULL DEFAULT 'TRY',
      status        TEXT NOT NULL DEFAULT 'available',
      property_type TEXT NOT NULL,
      province      TEXT NOT NULL,
      district      TEXT,
      address       TEXT,
      latitude      REAL,
      longitude     REAL,
      area_sqm      REAL,
      rooms         TEXT,
      floor         INTEGER,
      total_floors  INTEGER,
      building_age  INTEGER,
      heating       TEXT,
      furnished     INTEGER DEFAULT 0,
      balcony       INTEGER DEFAULT 0,
      parking       INTEGER DEFAULT 0,
      elevator      INTEGER DEFAULT 0,
      contact_name  TEXT,
      contact_phone TEXT,
      notes         TEXT,
      listed_by     INTEGER REFERENCES users(id),
      views         INTEGER DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS property_images (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER NOT NULL,
      filename    TEXT NOT NULL,
      is_cover    INTEGER DEFAULT 0,
      sort_order  INTEGER DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      property_id INTEGER NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER,
      action      TEXT NOT NULL,
      entity_type TEXT,
      entity_id   INTEGER,
      details     TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_properties_province  ON properties(province);
    CREATE INDEX IF NOT EXISTS idx_properties_status    ON properties(status);
    CREATE INDEX IF NOT EXISTS idx_properties_type      ON properties(property_type);
    CREATE INDEX IF NOT EXISTS idx_images_property      ON property_images(property_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_user       ON favorites(user_id);
  `)

  // Varsayılan admin
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('admin')
  if (!existing) {
    const hash = bcrypt.hashSync('admin123', 10)
    db.prepare(`
      INSERT INTO users (username, password, full_name, role)
      VALUES ('admin', ?, 'Sistem Yöneticisi', 'admin')
    `).run(hash)
    console.log('[DB] Varsayılan admin: admin / admin123')
  }

  // İlk kayıtta hemen kaydet
  const data = rawDb.export()
  fs.writeFileSync(dbPath, Buffer.from(data))

  return db
}

function getDb() {
  if (!db) throw new Error('Veritabanı henüz başlatılmadı')
  return db
}

module.exports = { initDatabase, getDb, getImagesDir }
