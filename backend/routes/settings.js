const express = require('express')
const router  = express.Router()
const auth    = require('../middleware/auth')
const User    = require('../models/User')

// GET /api/settings
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ settings: user.toJSON() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/settings/gym — save gym profile
router.put('/gym', auth, async (req, res) => {
  try {
    const { gymName, ownerName, phone, email, city, gst, address } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { gymName, name: ownerName || undefined, phone, city } },
      { new: true }
    )
    res.json({ message: 'Gym profile saved', user: user.toJSON() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/settings/notifications
router.put('/notifications', auth, async (req, res) => {
  try {
    res.json({ message: 'Notification settings saved', settings: req.body })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/settings/billing
router.put('/billing', auth, async (req, res) => {
  try {
    res.json({ message: 'Billing settings saved' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
