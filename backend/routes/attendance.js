const express    = require('express')
const router     = express.Router()
const auth       = require('../middleware/auth')
const { Attendance } = require('../models/models')
const Member     = require('../models/Member')

// GET /api/attendance — today's log
router.get('/', auth, async (req, res) => {
  try {
    const { date, memberId, limit = 100 } = req.query
    const gymId = req.user.gymId

    const start = date ? new Date(date) : new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setHours(23, 59, 59, 999)

    const filter = { gymId, checkinAt: { $gte: start, $lte: end } }
    if (memberId) filter.memberId = memberId

    const logs = await Attendance.find(filter)
      .populate('memberId', 'firstName lastName phone plan status')
      .sort({ checkinAt: -1 })
      .limit(Number(limit))

    res.json({ logs, total: logs.length, date: start.toISOString().split('T')[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/attendance/checkin
router.post('/checkin', auth, async (req, res) => {
  try {
    const { memberId, method = 'manual', deviceSn } = req.body
    if (!memberId) return res.status(400).json({ error: 'memberId is required' })

    const member = await Member.findOne({ _id: memberId, gymId: req.user.gymId })
    if (!member) return res.status(404).json({ error: 'Member not found' })

    // Check if already checked in today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const existing = await Attendance.findOne({
      memberId, gymId: req.user.gymId,
      checkinAt: { $gte: today },
      checkoutAt: { $exists: false },
    })
    if (existing) return res.status(409).json({ error: 'Member already checked in today', log: existing })

    const log = await Attendance.create({
      gymId: req.user.gymId,
      memberId,
      method,
      deviceSn,
      checkinAt: new Date(),
    })

    res.status(201).json({
      log,
      member: { name: `${member.firstName} ${member.lastName}`, plan: member.plan, status: member.status },
      message: `${member.firstName} checked in at ${new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}`,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/attendance/checkout
router.post('/checkout', auth, async (req, res) => {
  try {
    const { memberId } = req.body
    const today = new Date(); today.setHours(0, 0, 0, 0)

    const log = await Attendance.findOneAndUpdate(
      { memberId, gymId: req.user.gymId, checkinAt: { $gte: today }, checkoutAt: { $exists: false } },
      { $set: { checkoutAt: new Date() } },
      { new: true }
    )
    if (!log) return res.status(404).json({ error: 'No active check-in found' })
    res.json({ log, message: 'Checked out successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Biometric ADMS push endpoint (eSSL device pushes here)
router.post('/biometric-push', async (req, res) => {
  try {
    const { SN, ATTLOG } = req.body
    if (!ATTLOG) return res.status(400).send('No ATTLOG data')
    // ATTLOG format: "userID datetime status verifyType workCode"
    // e.g. "1001 2025-03-20 08:30:00 0 1 0"
    const lines = ATTLOG.trim().split('\n')
    console.log(`Biometric push from device ${SN}: ${lines.length} records`)
    // In production: parse lines and create attendance records
    res.send('OK')
  } catch (err) {
    res.status(500).send('Error')
  }
})

// GET /api/attendance/stats — summary for dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

    const [todayCount, biometric, qr, manual] = await Promise.all([
      Attendance.countDocuments({ gymId: req.user.gymId, checkinAt: { $gte: today, $lt: tomorrow } }),
      Attendance.countDocuments({ gymId: req.user.gymId, checkinAt: { $gte: today, $lt: tomorrow }, method: 'biometric' }),
      Attendance.countDocuments({ gymId: req.user.gymId, checkinAt: { $gte: today, $lt: tomorrow }, method: 'qr' }),
      Attendance.countDocuments({ gymId: req.user.gymId, checkinAt: { $gte: today, $lt: tomorrow }, method: 'manual' }),
    ])

    res.json({ today: todayCount, biometric, qr, manual })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
