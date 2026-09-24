const express = require('express')
const router = express.Router()
const { requireAdmin } = require('./middleware')
const HomepageContent = require('../models/HomepageContent')
const ActivityLog = require('../models/ActivityLog')

// GET /api/admin/homepage-content - Get all sections
router.get('/', requireAdmin, async (req, res) => {
  try {
    const sections = await HomepageContent.find().sort({ order: 1 })
    res.json(sections)
  } catch (error) {
    console.error('Get homepage content error:', error)
    res.status(500).json({ message: 'Error fetching homepage content', error: error.message })
  }
})

// GET /api/admin/homepage-content/:section
router.get('/:section', requireAdmin, async (req, res) => {
  try {
    let section = await HomepageContent.findOne({ section: req.params.section })
    if (!section) {
      section = await HomepageContent.create({ section: req.params.section })
    }
    res.json(section)
  } catch (error) {
    console.error('Get homepage section error:', error)
    res.status(500).json({ message: 'Error fetching section', error: error.message })
  }
})

// PUT /api/admin/homepage-content/:section
router.put('/:section', requireAdmin, async (req, res) => {
  try {
    let section = await HomepageContent.findOne({ section: req.params.section })
    
    if (!section) {
      section = await HomepageContent.create({ section: req.params.section, ...req.body })
    } else {
      Object.assign(section, req.body)
      await section.save()
    }

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'update',
      resource: 'homepage-content',
      resourceId: section._id,
      details: `Updated ${req.params.section} section`
    })

    res.json(section)
  } catch (error) {
    console.error('Update homepage section error:', error)
    res.status(500).json({ message: 'Error updating section', error: error.message })
  }
})

// PUT /api/admin/homepage-content/reorder - Reorder sections
router.put('/reorder', requireAdmin, async (req, res) => {
  try {
    const { sections } = req.body // Array of { section, order }
    
    const updatePromises = sections.map(({ section, order }) =>
      HomepageContent.updateOne({ section }, { $set: { order } })
    )
    
    await Promise.all(updatePromises)

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'update',
      resource: 'homepage-content',
      details: 'Reordered homepage sections'
    })

    const updatedSections = await HomepageContent.find().sort({ order: 1 })
    res.json(updatedSections)
  } catch (error) {
    console.error('Reorder sections error:', error)
    res.status(500).json({ message: 'Error reordering sections', error: error.message })
  }
})

module.exports = router

