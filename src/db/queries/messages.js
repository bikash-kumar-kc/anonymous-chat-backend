import { db } from '../../config/db.js'
import { messages } from '../../db/schema.js'
import { eq } from 'drizzle-orm'

// insert new message — called before broadcast
export async function insertMessage(roomId, senderToken, content) {
  const result = await db
    .insert(messages)
    .values({
      roomId,
      senderToken,
      content,
      status: 'active'
    })
    .returning({
      id: messages.id,
      sentAt: messages.sentAt
    })

  return result[0]
}

// soft delete flagged message — called by deletion worker
export async function deleteMessage(messageId) {
  await db
    .update(messages)
    .set({ status: 'deleted' })
    .where(eq(messages.id, messageId))
}