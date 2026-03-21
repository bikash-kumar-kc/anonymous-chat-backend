import 'dotenv/config'
import http from 'http'
import { app } from './app.js'
import { connectDb } from './config/db.js'
import { connectRedis } from './config/redis.js'
import { initSocket } from './config/socket.js'
import { startWorkers } from './workers/index.js'
import { scheduleGhostCleanup } from './jobs/ghostCleanup.job.js'

const PORT = process.env.PORT || 3000

async function start() {
  try {
    // 1. connect databases first
    await connectDb()
    console.log('✅ Postgres connected')

    await connectRedis()
    console.log('✅ Redis connected')

    // 2. create HTTP server from express app
    const httpServer = http.createServer(app)

    // 3. attach Socket.io to HTTP server
    initSocket(httpServer)
    console.log('✅ Socket.io initialized')

    // 4. start BullMQ workers
    startWorkers()
    console.log('✅ Workers started')

    // 5. schedule cleanup job
    await scheduleGhostCleanup()
    console.log('✅ Ghost cleanup scheduled')

    // 6. start listening
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })

  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

// graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...')
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...')
  process.exit(0)
})

start()