import { startModerationWorker } from "./moderation.worker.js";
import { startDeletionWorker } from "./deletion.worker.js";
import { startStrikeWorker } from "./strike.worker.js";
import { startNotificationWorker } from "./notification.worker.js";
import { startGhostCleanupWorker } from "./ghostCleanup.worker.js";
import { startRoomCleanupWorker } from "./roomCleanUp.worker.js";

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
      console.error(`❌ Worker job failed [${job?.name}]:`, err.message);
    });

    worker.on("completed", (job) => {
      console.log(`✅ Worker job completed [${job?.name}]`);

      if (job?.name === "clean room life more than 2 hrs") {
        const { cleanedRooms, failedRooms } = job.returnvalue;

        console.log(
          `cleanedRooms: ${cleanedRooms} failedRooms: ${failedRooms} `,
        );
      }
    });
  });

  return workers;
}
