import { roomCleanUpQueue } from "../index.js";

const GHOST_CLEARUP_ROOM = 2 * 60 * 60 * 1000;

export const startGhostCleanupRoomScheduler = async () => {
  await roomCleanUpQueue.upsertJobScheduler(
    "clean room life more than 2 hrs",
    {
      every: GHOST_CLEARUP_ROOM,
    },
    {},
  );

  console.log("Room clean up is scheduled for every 2hrs");
};
