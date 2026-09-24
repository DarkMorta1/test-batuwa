const express = require('express')
const router = express.Router()
const { requireAdmin } = require('./middleware')
const ThemeSettings = require('../models/ThemeSettings')
const ActivityLog = require('../models/ActivityLog')

// GET /api/admin/theme
router.get('/', requireAdmin, async (req, res) => {
  try {
    const theme = await ThemeSettings.getTheme()
    res.json(theme)
  } catch (error) {
    console.error('Get theme settings error:', error)
    res.status(500).json({ message: 'Error fetching theme settings', error: error.message })
  }
})

// PUT /api/admin/theme
router.put('/', requireAdmin, async (req, res) => {
  try {
    let theme = await ThemeSettings.findOne()
    
    if (!theme) {
      theme = await ThemeSettings.create(req.body)
    } else {
      Object.assign(theme, req.body)
      await theme.save()
    }

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'update',
      resource: 'theme',
      details: 'Updated theme settings'
    })

    res.json(theme)
  } catch (error) {
    console.error('Update theme settings error:', error)
    res.status(500).json({ message: 'Error updating theme settings', error: error.message })
  }
})

module.exports = router

