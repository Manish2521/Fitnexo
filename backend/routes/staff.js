const express = require('express')
const router  = express.Router()
const auth    = require('../middleware/auth')
const { Staff } = require('../models/models')

// GET /api/staff
router.get('/', auth, async (req, res) => {
  try {
    const staff = await Staff.find({ gymId: req.user.gymId }).sort({ createdAt: -1 })
    res.json({ staff, total: staff.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/staff
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone } = req.body
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' })
    const member = await Staff.create({ ...req.body, gymId: req.user.gymId })
    res.status(201).json({ member, message: `${name} added to staff` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/staff/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const staff = await Staff.findOneAndUpdate(
      { _id: req.params.id, gymId: req.user.gymId },
      { $set: req.body }, { new: true }
    )
    if (!staff) return res.status(404).json({ error: 'Staff not found' })
    res.json({ staff, message: 'Staff updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/staff/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Staff.findOneAndDelete({ _id: req.params.id, gymId: req.user.gymId })
    res.json({ message: 'Staff removed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/staff/:id/attendance
router.post('/:id/attendance', auth, async (req, res) => {
  try {
    const { status = 'present' } = req.body
    res.json({ message: 'Attendance marked', staffId: req.params.id, status, date: new Date().toISOString().split('T')[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
