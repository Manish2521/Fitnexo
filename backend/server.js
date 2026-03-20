require('dotenv').config()
const express     = require('express')
const mongoose    = require('mongoose')
const cors        = require('cors')
const helmet      = require('helmet')
const morgan      = require('morgan')
const rateLimit   = require('express-rate-limit')

const app  = express()
const PORT = process.env.PORT || 5000

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }))

// ─── MongoDB ─────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message))

mongoose.connection.on('error', err => console.error('MongoDB connection error:', err))

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'))
app.use('/api/members',    require('./routes/members'))
app.use('/api/attendance', require('./routes/attendance'))
app.use('/api/billing',    require('./routes/billing'))
app.use('/api/staff',      require('./routes/staff'))
app.use('/api/leads',      require('./routes/leads'))
app.use('/api/sms',        require('./routes/sms'))
app.use('/api/reports',    require('./routes/reports'))
app.use('/api/settings',   require('./routes/settings'))
app.use('/api/biometric',  require('./routes/biometric'))

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

// ─── Root Ping & Message Route ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'Ping received! ✅ Message sent successfully.',
    timestamp: new Date().toISOString(),
    status: 'ok',
  })
})

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`\n💪 FitGymSoftware® API running`)
  console.log(`   URL:  http://localhost:${PORT}`)
  console.log(`   Mode: ${process.env.NODE_ENV}`)
  console.log(`   DB:   ${process.env.MONGODB_URI?.slice(0, 50)}...\n`)
})

module.exports = app
