const express = require('express')
const router  = express.Router()
const auth    = require('../middleware/auth')
const { Lead } = require('../models/models')
const Member  = require('../models/Member')

// GET /api/leads
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query
    const filter = { gymId: req.user.gymId }
    if (status) filter.status = status
    const leads = await Lead.find(filter).sort({ createdAt: -1 })
    res.json({ leads, total: leads.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/leads
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone } = req.body
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' })
    const lead = await Lead.create({ ...req.body, gymId: req.user.gymId })
    res.status(201).json({ lead, message: `Lead "${name}" added` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/leads/:id — update status, notes, etc.
router.put('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, gymId: req.user.gymId },
      { $set: req.body }, { new: true }
    )
    if (!lead) return res.status(404).json({ error: 'Lead not found' })

    // If converting to member, create member record
    if (req.body.status === 'converted' && !lead.convertedMemberId) {
      const member = await Member.create({
        gymId: req.user.gymId,
        firstName: lead.name.split(' ')[0],
        lastName: lead.name.split(' ').slice(1).join(' '),
        phone: lead.phone,
        email: lead.email || '',
        plan: 'Standard 1M',
        status: 'active',
      })
      lead.convertedMemberId = member._id
      await Lead.findByIdAndUpdate(lead._id, { convertedMemberId: member._id })
    }

    res.json({ lead, message: 'Lead updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/leads/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Lead.findOneAndDelete({ _id: req.params.id, gymId: req.user.gymId })
    res.json({ message: 'Lead deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
