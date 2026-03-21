import { db } from '../../config/db.js'
import { rooms } from '../../db/schema.js'
import { eq, sql } from 'drizzle-orm'

// find existing room within 5km of given coordinates
export async function findRoomNear(lat, lng) {
  const result = await db.execute(sql`
    SELECT id, center_lat, center_lng
    FROM rooms
    WHERE ST_DWithin(
      center_point::geography,
      ST_MakePoint(${lng}, ${lat})::geography,
      5000
    )
    AND is_active = true
    LIMIT 1
  `)

  return result.rows[0] || null
}

// create new room centered on user's coordinates
export async function createRoom(lat, lng) {
  const result = await db.execute(sql`
    INSERT INTO rooms (id, center_lat, center_lng, center_point, is_active, created_at)
    VALUES (
      gen_random_uuid(),
      ${lat}, ${lng},
      ST_MakePoint(${lng}, ${lat})::geography,
      true,
      NOW()
    )
    RETURNING id
  `)

  return result.rows[0].id
}

// get room by id — used for distance check in location update
export async function getRoomById(roomId) {
  const result = await db
    .select({
      id: rooms.id,
      centerLat: rooms.centerLat,
      centerLng: rooms.centerLng
    })
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1)

  return result[0] || null
}

// mark room as inactive when last user leaves
export async function deactivateRoom(roomId) {
  await db
    .update(rooms)
    .set({ isActive: false })
    .where(eq(rooms.id, roomId))
}