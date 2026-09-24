const express = require('express')
const router = express.Router()
const { requireAdmin } = require('./middleware')
const SEOSettings = require('../models/SEOSettings')
const ActivityLog = require('../models/ActivityLog')

// GET /api/admin/seo - Get all SEO settings
router.get('/', requireAdmin, async (req, res) => {
  try {
    const settings = await SEOSettings.find().sort({ page: 1 })
    res.json(settings)
  } catch (error) {
    console.error('Get SEO settings error:', error)
    res.status(500).json({ message: 'Error fetching SEO settings', error: error.message })
  }
})

// GET /api/admin/seo/:page
router.get('/:page', requireAdmin, async (req, res) => {
  try {
    let settings = await SEOSettings.findOne({ page: req.params.page })
    if (!settings) {
      settings = await SEOSettings.create({ page: req.params.page })
    }
    res.json(settings)
  } catch (error) {
    console.error('Get SEO setting error:', error)
    res.status(500).json({ message: 'Error fetching SEO setting', error: error.message })
  }
})

// PUT /api/admin/seo/:page
router.put('/:page', requireAdmin, async (req, res) => {
  try {
    let settings = await SEOSettings.findOne({ page: req.params.page })
    
    if (!settings) {
      settings = await SEOSettings.create({ page: req.params.page, ...req.body })
    } else {
      Object.assign(settings, req.body)
      await settings.save()
    }

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'update',
      resource: 'seo',
      resourceId: settings._id,
      details: `Updated SEO settings for ${req.params.page} page`
    })

    res.json(settings)
  } catch (error) {
    console.error('Update SEO settings error:', error)
    res.status(500).json({ message: 'Error updating SEO settings', error: error.message })
  }
})

module.exports = router

