import { findRoomNear, createRoom } from '../../db/queries/rooms.js'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export async function findOrCreateRoom(lat, lng) {
  // advisory lock to prevent race condition
  const lockId = getGridCellId(lat, lng)

  await sql`SELECT pg_advisory_lock(${lockId})`

  try {
    // search for existing room
    const existing = await findRoomNear(lat, lng)
    if (existing) return existing.id

    // create new room
    const roomId = await createRoom(lat, lng)
    return roomId

  } finally {
    await sql`SELECT pg_advisory_unlock(${lockId})`
  }
}

function getGridCellId(lat, lng) {
  const gridLat = Math.floor(lat * 20)
  const gridLng = Math.floor(lng * 20)
  return Math.abs(gridLat * 1000 + gridLng)
}