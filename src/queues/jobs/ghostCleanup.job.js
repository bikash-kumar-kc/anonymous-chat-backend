import { ghostCleanupQueue } from "../index.js";

const GHOST_CLEANUP = 5 * 60 * 1000;


export async function scheduleGhostCleanup() {
  // remove any existing repeat jobs first to avoid duplicates
  await ghostCleanupQueue.obliterate({ force: true });

  // schedule to run every 5 minutes
  await ghostCleanupQueue.add(
    "cleanup",
    {},
    {
      repeat: { every: GHOST_CLEANUP },
    },
  );
}
