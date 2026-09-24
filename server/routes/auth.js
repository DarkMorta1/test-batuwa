const express = require('express')
const router = express.Router()
const Admin = require('../models/Admin')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ActivityLog = require('../models/ActivityLog')

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ message: 'Missing credentials' })

  try {
    const admin = await Admin.findOne({ username })
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' })

    if (!admin.isActive) {
      return res.status(403).json({ message: 'Account is inactive' })
    }

    const match = await bcrypt.compare(password, admin.passwordHash)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })

    // Update last login (use updateOne to avoid validation issues with existing admins)
    const lastLoginIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
    await Admin.updateOne(
      { _id: admin._id },
      { 
        lastLogin: new Date(),
        lastLoginIp: lastLoginIp
      }
    )

    const token = jwt.sign(
      { 
        id: admin._id, 
        username: admin.username, 
        role: admin.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '12h' }
    )

    // Log activity
    await ActivityLog.create({
      adminId: admin._id,
      adminUsername: admin.username,
      action: 'login',
      resource: 'auth',
      details: 'Admin logged in',
      ipAddress: lastLoginIp,
      userAgent: req.headers['user-agent'] || ''
    })

    res.json({ token, admin: { id: admin._id, username: admin.username, role: admin.role } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' })
    }

    // Check if username or email already exists
    const exists = await Admin.findOne({ $or: [{ username }, { email }] })
    if (exists) {
      return res.status(400).json({ message: 'Username or email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const newAdmin = new Admin({
      username,
      email,
      passwordHash,
      fullName: fullName || '',
      role: role || 'admin'
    })

    await newAdmin.save()

    res.status(201).json({ message: 'Admin created successfully', adminId: newAdmin._id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/auth/verify - Verify token (admin)
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ valid: false })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const admin = await Admin.findById(decoded.id).select('-passwordHash')
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ valid: false })
    }

    res.json({ valid: true, admin })
  } catch (err) {
    res.status(401).json({ valid: false })
  }
})

module.exports = router
