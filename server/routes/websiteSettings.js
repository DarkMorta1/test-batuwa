const express = require('express')
const router = express.Router()
const { requireAdmin } = require('./middleware')
const WebsiteSettings = require('../models/WebsiteSettings')
const ActivityLog = require('../models/ActivityLog')

// GET /api/admin/website-settings
router.get('/', requireAdmin, async (req, res) => {
  try {
    const settings = await WebsiteSettings.getSettings()
    res.json(settings)
  } catch (error) {
    console.error('Get website settings error:', error)
    res.status(500).json({ message: 'Error fetching settings', error: error.message })
  }
})

// PUT /api/admin/website-settings
router.put('/', requireAdmin, async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne()
    
    if (!settings) {
      settings = await WebsiteSettings.create(req.body)
    } else {
      Object.assign(settings, req.body)
      await settings.save()
    }

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'update',
      resource: 'website-settings',
      details: 'Updated website settings'
    })

    res.json(settings)
  } catch (error) {
    console.error('Update website settings error:', error)
    res.status(500).json({ message: 'Error updating settings', error: error.message })
  }
})

module.exports = router

