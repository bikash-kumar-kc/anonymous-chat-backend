import { Worker } from "bullmq";
import OpenAI from "openai";
import { redis } from "../../config/redis.js";
import { deletionQueue, strikeQueue, notificationQueue } from "../index.js";
import checkToxicity from "../../utils/googleModeration.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function startModerationWorker() {
  return new Worker(
    "moderation",
    async (job) => {
      const { messageId, content, userId, roomId, socketId, hashedIp } =
        job.data;

      // const score = await checkToxicity(content);

      // if (score > 0.7) {
      //   console.log(`⚠️ MessageId ${messageId} message: ${content} is toxic `);

      //   await Promise.all([
      //     deletionQueue.add("delete", { messageId, roomId }),
      //     strikeQueue.add("strike", { userId, hashedIp }),
      //     notificationQueue.add("notify", {
      //       userId,
      //       socketId,
      //       type: "message_flagged",
      //       messageId,
      //     }),
      //   ]);

      //   return;
      // } else if (score > 0.5) {
      //   notificationQueue.add("notify", {
      //     userId,
      //     socketId,
      //     type: "message_moderately toxic. Please show some culture.",
      //     messageId,
      //   });
        
      // } else console.log("Safe ✅");

      // call OpenAI moderation
      const response = await openai.moderations.create({ input: content });
      const result = response.results[0];

      if (!result.flagged) return // clean → do nothing;

      await Promise.all([
        deletionQueue.add("delete", { messageId, roomId }),
        strikeQueue.add("strike", { userId, hashedIp }),
        notificationQueue.add("notify", {
          userId,
          socketId,
          type: "message_flagged",
          messageId,
        }),
      ]);

     
    },
    {
      connection: redis,
      concurrency: 10, // process 10 moderation jobs at a time
    },
  );
}
