const express = require('express')
const router = express.Router()
const BannerSettings = require('../models/BannerSettings')
const { requireAdmin } = require('./middleware')
const ActivityLog = require('../models/ActivityLog')

// GET /api/banner - Get banner settings (public)
// GET /api/admin/banner - Get banner settings (admin)
router.get('/', async (req, res) => {
  try {
    let settings = await BannerSettings.findOne()
    
    // If no settings exist, create default
    if (!settings) {
      settings = new BannerSettings({
        images: [
          '/images/1765290625930.JPG',
          '/images/1765290625942.JPG',
          '/images/1765290625950.jpg',
          '/images/1765290626003.jpg'
        ],
        title: 'TRAVEL WITH BATUWA',
        eyebrow: 'Travel',
        rotationInterval: 4000,
        enabled: true
      })
      await settings.save()
    }
    
    res.json(settings)
  } catch (error) {
    console.error('Get banner settings error:', error)
    res.status(500).json({ message: 'Error fetching banner settings', error: error.message })
  }
})

// PUT /api/admin/banner - Update banner settings (admin only)
router.put('/', requireAdmin, async (req, res) => {
  try {
    const adminId = req.admin.id
    const adminUsername = req.admin.username
    
    let settings = await BannerSettings.findOne()
    
    if (!settings) {
      settings = new BannerSettings(req.body)
    } else {
      Object.assign(settings, req.body)
    }
    
    await settings.save()
    
    // Log activity
    await ActivityLog.create({
      adminId,
      adminUsername,
      action: 'update',
      resource: 'banner',
      details: 'Banner settings updated',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || ''
    })
    
    res.json(settings)
  } catch (error) {
    console.error('Update banner settings error:', error)
    res.status(500).json({ message: 'Error updating banner settings', error: error.message })
  }
})

module.exports = router

