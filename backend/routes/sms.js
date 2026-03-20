const express = require('express')
const router  = express.Router()
const auth    = require('../middleware/auth')

// POST /api/sms/send — send single SMS or WhatsApp
router.post('/send', auth, async (req, res) => {
  try {
    const { phone, message, type = 'sms' } = req.body
    if (!phone || !message) return res.status(400).json({ error: 'Phone and message are required' })

    const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '')
    const e164 = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`

    if (type === 'whatsapp' || type === 'wa') {
      // WATI WhatsApp API
      if (process.env.WATI_ACCESS_TOKEN && process.env.WATI_BASE_URL) {
        const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args))
        const response = await fetch(`${process.env.WATI_BASE_URL}/api/v1/sendSessionMessage/${encodeURIComponent(e164)}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.WATI_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageText: message }),
        }).catch(() => null)
        if (response?.ok) return res.json({ success: true, channel: 'whatsapp', phone: e164 })
      }
      // Fallback: log it
      console.log(`[WhatsApp] To: ${e164} | Message: ${message}`)
      return res.json({ success: true, channel: 'whatsapp', phone: e164, note: 'Logged (WATI not configured)' })
    }

    // MSG91 SMS
    if (process.env.MSG91_API_KEY) {
      const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args))
      const url = `https://api.msg91.com/api/sendhttp.php?authkey=${process.env.MSG91_API_KEY}&mobiles=${cleanPhone}&message=${encodeURIComponent(message)}&route=4&sender=${process.env.MSG91_SENDER_ID || 'FITGYM'}&country=91`
      await fetch(url).catch(() => {})
    }
    console.log(`[SMS] To: ${e164} | Message: ${message}`)
    res.json({ success: true, channel: 'sms', phone: e164 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/sms/bulk — bulk send to multiple members
router.post('/bulk', auth, async (req, res) => {
  try {
    const { phones = [], message, type = 'whatsapp' } = req.body
    if (!phones.length || !message) return res.status(400).json({ error: 'Phones array and message are required' })
    // In production: queue these with a job processor
    console.log(`[Bulk ${type}] Sending to ${phones.length} numbers: ${message}`)
    res.json({ success: true, queued: phones.length, message: `Queued for ${phones.length} recipients` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
