const express = require('express')
const router  = express.Router()
const jwt     = require('jsonwebtoken')
const User    = require('../models/User')

const SECRET = process.env.JWT_SECRET || 'fitgympro_secret'

function makeToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, gymId: user._id.toString(), gymName: user.gymName },
    SECRET,
    { expiresIn: '7d' }
  )
}

// Demo accounts — always work without DB
const DEMO_ACCOUNTS = {
  'admin@gym.com':   { pw: 'admin123',   role: 'admin',   name: 'Admin Owner',   gymName: 'Demo Gym' },
  'manager@gym.com': { pw: 'manager123', role: 'manager', name: 'Rajan Manager', gymName: 'Demo Gym' },
  'trainer@gym.com': { pw: 'trainer123', role: 'trainer', name: 'Suresh Trainer',gymName: 'Demo Gym' },
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { gymName, ownerName, phone, email, password, city, plan } = req.body
    if (!ownerName || !phone || !password)
      return res.status(400).json({ error: 'Name, phone and password are required' })
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const loginEmail = email?.trim().toLowerCase() || `${phone}@fitgym.local`

    const existing = await User.findOne({ email: loginEmail })
    if (existing) return res.status(400).json({ error: 'Email already registered. Please login.' })

    const user = await User.create({
      gymName: gymName || 'My Gym',
      name:    ownerName.trim(),
      email:   loginEmail,
      phone:   phone.trim(),
      password,
      city,
      plan: plan || 'pro',
      role: 'admin',
    })

    const token = makeToken(user)
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, gymName: user.gymName },
    })
  } catch (err) {
    console.error('Register error:', err)
    if (err.code === 11000) return res.status(400).json({ error: 'Email already registered' })
    res.status(500).json({ error: 'Registration failed: ' + err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' })

    const emailLower = email.trim().toLowerCase()

    // Check demo accounts first
    const demo = DEMO_ACCOUNTS[emailLower]
    if (demo) {
      if (password !== demo.pw) return res.status(401).json({ error: 'Invalid email or password' })
      const token = jwt.sign(
        { id: `demo_${emailLower}`, role: demo.role, gymId: `demo_${emailLower}`, gymName: demo.gymName },
        SECRET,
        { expiresIn: '7d' }
      )
      return res.json({
        token,
        user: { id: `demo_${emailLower}`, name: demo.name, email: emailLower, role: demo.role, gymName: demo.gymName },
      })
    }

    // Real user lookup
    const user = await User.findOne({ email: emailLower })
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })
    if (!user.isActive) return res.status(403).json({ error: 'Account is deactivated. Contact support.' })

    const ok = await user.comparePassword(password)
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

    const token = makeToken(user)
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, gymName: user.gymName },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

module.exports = router
