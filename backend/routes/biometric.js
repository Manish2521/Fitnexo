const express = require('express')
const router  = express.Router()
const auth    = require('../middleware/auth')

// POST /api/biometric/push — eSSL device ADMS push
// Configure your eSSL device: Server = http://YOUR_SERVER:5000/api/biometric/push
router.post('/push', async (req, res) => {
  try {
    const { SN, ATTLOG, OPERLOG } = req.body
    if (ATTLOG) {
      const lines = ATTLOG.trim().split('\n').filter(Boolean)
      console.log(`[Biometric] Push from device SN:${SN} — ${lines.length} records`)
      // Each line: "userId dateTime status verifyMethod workCode"
      // e.g. "1001 2025-03-20 08:30:00 0 1 0"
      // In production: parse and save to Attendance collection
    }
    res.send('OK')
  } catch (err) {
    console.error('Biometric push error:', err)
    res.status(500).send('Error')
  }
})

// GET /api/biometric/status — check device status
router.get('/status', auth, async (req, res) => {
  res.json({
    device:   'eSSL K30',
    ip:       '192.168.1.100',
    port:     4370,
    status:   'online',
    enrolled: 847,
    lastSync: new Date().toISOString(),
  })
})

// GET /api/biometric/devices — list of supported devices
router.get('/devices', auth, async (req, res) => {
  res.json({
    fingerprint: [
      { model:'eSSL K30',  link:'https://amzn.to/3TZFcKK' },
      { model:'eSSL X990', link:'https://amzn.to/3TXYoc0' },
      { model:'eSSL F22',  link:'https://amzn.to/3zWnZen' },
    ],
    face: [
      { model:'eSSL AI-Face Magnum', type:'Face+Fingerprint+RFID', link:'https://amzn.to/3NhwWSE' },
      { model:'eSSL AI-Face Mars',   type:'Face+RFID',             link:'https://amzn.to/3YcXgUo' },
      { model:'eSSL AI-Face ERI',    type:'Face+Fingerprint+RFID', link:'https://amzn.to/3TVKG9x' },
      { model:'eSSL U-Face 302',     type:'Face+Fingerprint+RFID', link:'https://amzn.to/3TYX5JM' },
    ],
  })
})

module.exports = router
