import { startModerationWorker } from './moderation.worker.js'
import { startDeletionWorker } from './deletion.worker.js'
import { startStrikeWorker } from './strike.worker.js'
import { startNotificationWorker } from './notification.worker.js'
import { startGhostCleanupWorker } from './ghostCleanup.worker.js'

export function startWorkers() {
  const workers = [
    startModerationWorker(),
    startDeletionWorker(),
    startStrikeWorker(),
    startNotificationWorker(),
    startGhostCleanupWorker()
  ]

  // global error handler for all workers
  workers.forEach((worker) => {
    worker.on('failed', (job, err) => {
      console.error(`❌ Worker job failed [${job?.name}]:`, err.message)
    })

    worker.on('completed', (job) => {
      console.log(`✅ Worker job completed [${job?.name}]`)
    })
  })

  return workers
}