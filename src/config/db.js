import pg from 'pg'

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

export async function connectDb() {
  // test connection on startup
  const client = await pool.connect()
  await client.query('SELECT 1')
  client.release()
}

export { pool as db }