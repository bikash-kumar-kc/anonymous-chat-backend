import { startModerationWorker } from "./moderation.worker.js";
import { startDeletionWorker } from "./deletion.worker.js";
import { startStrikeWorker } from "./strike.worker.js";
import { startNotificationWorker } from "./notification.worker.js";
import { startGhostCleanupWorker } from "./ghostCleanup.worker.js";
import { startRoomCleanupWorker } from "./roomCleanUp.worker.js";
import { logger } from "../../config/logger.js";

export function startWorkers() {
  const workers = [
    startModerationWorker(),
    startDeletionWorker(),
    startStrikeWorker(),
    startNotificationWorker(),
    startGhostCleanupWorker(),
    startRoomCleanupWorker(),
  ];

  // global error handler for all workers
  workers.forEach((worker) => {
    
    worker.on("failed", (job, err) => {
      const date = new Date();
      logger.error({
        type: "JOB_FAILED",
        jobId: job.id,
        jobName: job?.name,
        jobQueue: job?.queueName,
        error: err.message,
        date,
      });
    });

    worker.on("completed", (job) => {
      const date = new Date();

      logger.info({
        type: "JOB_SUCCESS",
        jobId: job.id,
        jobName: job?.name,
        jobQueue: job?.queueName,
        date,
      });
    });

    worker.on("active",(job)=>{
      const date = new Date();
      logger.info({
        type:"JOB_ACTIVE",
        jobId:job.id,
        jobName:job.name,
        queueName:job.queueName,
        date,
      })
    });

    worker.on("error",(err)=>{
      logger.error({
        type:"WORKER_ERROR",
        error:err.message,
      })
    })
  });

  return workers;
}
