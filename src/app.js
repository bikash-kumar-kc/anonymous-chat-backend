import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { joinRouter } from './routes/join.js'

const app = express()

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST']
}))
app.use(express.json())

// REST routes
app.use('/api', joinRouter)

// health check
app.get('/health', (req, res) => res.json({ status: 'ok' }))

export { app }