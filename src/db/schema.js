import { pgTable, uuid, doublePrecision, boolean, timestamp, text, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  centerLat: doublePrecision('center_lat').notNull(),
  centerLng: doublePrecision('center_lng').notNull(),
  // PostGIS column — drizzle doesn't natively type this, use raw sql
  centerPoint: text('center_point').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true })
}, (table) => ({
  centerPointIdx: index('idx_rooms_center_point').on(table.centerPoint),
  isActiveIdx: index('idx_rooms_is_active').on(table.isActive)
}))

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  senderToken: text('sender_token').notNull(),
  content: text('content').notNull(),
  status: text('status').default('active'),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  roomIdIdx: index('idx_messages_room_id').on(table.roomId, table.sentAt),
  statusIdx: index('idx_messages_status').on(table.status)
}))

export const blacklist = pgTable('blacklist', {
  id: uuid('id').primaryKey().defaultRandom(),
  hashedIp: text('hashed_ip').notNull().unique(),
  type: text('type').default('permanent'),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true })
}, (table) => ({
  hashedIpIdx: index('idx_blacklist_hashed_ip').on(table.hashedIp)
}))