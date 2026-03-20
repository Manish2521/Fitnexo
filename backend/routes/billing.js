const express  = require('express')
const router   = express.Router()
const auth     = require('../middleware/auth')
const { Payment } = require('../models/models')
const Member   = require('../models/Member')

const PLAN_PRICES = {
  'Standard 1M': 999, 'Standard 3M': 2499,
  'Pro 1M': 1499,     'Pro 3M': 3999,
  'Premium 6M': 6999, 'Annual': 10999,
}

// GET /api/billing — list payments
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, memberId } = req.query
    const filter = { gymId: req.user.gymId }
    if (status) filter.status = status
    if (memberId) filter.memberId = memberId

    const [payments, total] = await Promise.all([
      Payment.find(filter).sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page)-1)*Number(limit)),
      Payment.countDocuments(filter),
    ])
    res.json({ payments, total })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/billing — record payment
router.post('/', auth, async (req, res) => {
  try {
    const { memberId, memberName, plan, amount, method = 'cash', notes } = req.body
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount is required' })

    const payment = await Payment.create({
      gymId: req.user.gymId,
      memberId: memberId || undefined,
      memberName: memberName || '',
      plan: plan || '',
      amount: Number(amount),
      method: method.toLowerCase(),
      notes: notes || '',
      status: 'paid',
      collectedBy: req.user.id,
    })

    // If memberId given, update member's balance
    if (memberId) {
      await Member.findByIdAndUpdate(memberId, { $set: { balanceDue: 0 } })
    }

    res.status(201).json({
      payment,
      message: `Payment of ₹${Number(amount).toLocaleString('en-IN')} recorded`,
      invoiceNo: payment.invoiceNo,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/billing/summary — monthly revenue for reports
router.get('/summary', auth, async (req, res) => {
  try {
    const gymId = req.user.gymId
    const now   = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)

    const [monthTotal, allTime, pending] = await Promise.all([
      Payment.aggregate([
        { $match: { gymId: gymId.toString?.() || gymId, status: 'paid', createdAt: { $gte: start } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { gymId: gymId.toString?.() || gymId, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { gymId: gymId.toString?.() || gymId, status: 'due' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ])

    res.json({
      monthRevenue: monthTotal[0]?.total || 0,
      allTimeRevenue: allTime[0]?.total || 0,
      pendingDues: pending[0]?.total || 0,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/billing/:id — single payment / invoice
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, gymId: req.user.gymId })
    if (!payment) return res.status(404).json({ error: 'Payment not found' })
    res.json({ payment })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
