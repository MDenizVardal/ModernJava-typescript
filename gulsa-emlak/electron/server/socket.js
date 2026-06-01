const { Server } = require('socket.io')

let io = null

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    maxHttpBufferSize: 10e6,
  })

  io.on('connection', (socket) => {
    console.log(`[Socket] Bağlantı: ${socket.id}`)
    socket.on('disconnect', () => {
      console.log(`[Socket] Ayrıldı: ${socket.id}`)
    })
  })

  return io
}

function broadcast(event, data) {
  if (io) io.emit(event, data)
}

function getIo() { return io }

module.exports = { initSocket, broadcast, getIo }
