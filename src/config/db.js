import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../db/schema.js'

const sql = neon(process.env.DATABASE_URL)
export const db = drizzle(sql, { schema })

export async function connectDb() {
  try {
    // test connection
    await sql`SELECT 1`
  } catch (_err) {
    console.warn('DB cold start, retrying...')
    await new Promise(r => setTimeout(r, 2000))
    await sql`SELECT 1`
  }
}