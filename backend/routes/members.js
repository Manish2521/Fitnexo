const express = require('express')
const router  = express.Router()
const auth    = require('../middleware/auth')
const Member  = require('../models/Member')

// GET /api/members — list with search, filter, pagination
router.get('/', auth, async (req, res) => {
  try {
    const { page=1, limit=10, search, status } = req.query
    const gymId = req.user.gymId

    const filter = { gymId }
    if (status && status !== 'all') filter.status = status
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { phone:     { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
      ]
    }

    const [members, total] = await Promise.all([
      Member.find(filter).sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page)-1)*Number(limit)),
      Member.countDocuments(filter),
    ])

    res.json({ members, total, page: Number(page) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/members/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findOne({ _id: req.params.id, gymId: req.user.gymId })
    if (!member) return res.status(404).json({ error: 'Member not found' })
    res.json({ member })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/members — create
router.post('/', auth, async (req, res) => {
  try {
    const { firstName, phone, plan } = req.body
    if (!firstName || !phone) return res.status(400).json({ error: 'First name and phone are required' })

    // Calculate expiry based on plan
    const PLAN_DAYS = { 'Standard 1M':30, 'Standard 3M':90, 'Pro 1M':30, 'Pro 3M':90, 'Premium 6M':180, 'Annual':365 }
    const days = PLAN_DAYS[plan] || 30
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + days)

    const member = await Member.create({
      ...req.body,
      gymId: req.user.gymId,
      expiryDate,
    })
    res.status(201).json({ member, message: `${member.firstName} added successfully` })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Member code conflict, please retry' })
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/members/:id — update
router.put('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findOneAndUpdate(
      { _id: req.params.id, gymId: req.user.gymId },
      { $set: req.body },
      { new: true, runValidators: true }
    )
    if (!member) return res.status(404).json({ error: 'Member not found' })
    res.json({ member, message: 'Member updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/members/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Member.findOneAndDelete({ _id: req.params.id, gymId: req.user.gymId })
    res.json({ message: 'Member deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/members/:id/renew
router.post('/:id/renew', auth, async (req, res) => {
  try {
    const { plan } = req.body
    const PLAN_DAYS = { 'Standard 1M':30, 'Standard 3M':90, 'Pro 1M':30, 'Pro 3M':90, 'Premium 6M':180, 'Annual':365 }
    const days = PLAN_DAYS[plan] || 30
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + days)

    const member = await Member.findOneAndUpdate(
      { _id: req.params.id, gymId: req.user.gymId },
      { $set: { plan, expiryDate, status: 'active', balanceDue: 0 } },
      { new: true }
    )
    if (!member) return res.status(404).json({ error: 'Member not found' })
    res.json({ member, message: 'Membership renewed', expiryDate })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
