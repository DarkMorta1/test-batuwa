const express = require('express')
const router = express.Router()
const DisplaySettings = require('../models/DisplaySettings')
const Tour = require('../models/Tour')
const Blog = require('../models/Blog')
const { requireAdmin } = require('./middleware')
const ActivityLog = require('../models/ActivityLog')

// GET /api/display-settings - Get display order (public)
router.get('/', async (req, res) => {
  try {
    let settings = await DisplaySettings.findOne()
    
    // If no settings exist, create default with empty arrays
    if (!settings) {
      settings = new DisplaySettings({
        tourOrder: [],
        blogOrder: []
      })
      await settings.save()
    }
    
    res.json(settings)
  } catch (error) {
    console.error('Get display settings error:', error)
    res.status(500).json({ message: 'Error fetching display settings', error: error.message })
  }
})

// PUT /api/admin/display-settings - Update display order (admin only)
router.put('/', requireAdmin, async (req, res) => {
  try {
    const adminId = req.admin.id
    const adminUsername = req.admin.username
    
    let settings = await DisplaySettings.findOne()
    
    if (!settings) {
      settings = new DisplaySettings(req.body)
    } else {
      Object.assign(settings, req.body)
    }
    
    await settings.save()
    
    // Log activity
    await ActivityLog.create({
      adminId,
      adminUsername,
      action: 'update',
      resource: 'display-settings',
      details: 'Display order updated',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || ''
    })
    
    res.json(settings)
  } catch (error) {
    console.error('Update display settings error:', error)
    res.status(500).json({ message: 'Error updating display settings', error: error.message })
  }
})

// GET /api/display-settings/tours - Get tours in display order (public)
router.get('/tours', async (req, res) => {
  try {
    const settings = await DisplaySettings.findOne()
    const tourOrder = settings?.tourOrder || []
    
    // Get all published tours
    const allTours = await Tour.find({ status: 'published' })
    
    // Create a map for quick lookup
    const tourMap = new Map(allTours.map(t => [t._id.toString(), t]))
    
    // Build ordered array: first ordered tours, then any not in order
    const orderedTours = []
    const unorderedTours = []
    
    // Add tours in specified order
    for (const tourId of tourOrder) {
      const tour = tourMap.get(tourId.toString())
      if (tour) {
        orderedTours.push(tour)
        tourMap.delete(tourId.toString())
      }
    }
    
    // Add remaining tours (not in order list) sorted by createdAt
    unorderedTours.push(...Array.from(tourMap.values()))
    unorderedTours.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    res.json([...orderedTours, ...unorderedTours])
  } catch (error) {
    console.error('Get ordered tours error:', error)
    res.status(500).json({ message: 'Error fetching tours', error: error.message })
  }
})

// GET /api/display-settings/blogs - Get blogs in display order (public)
router.get('/blogs', async (req, res) => {
  try {
    const settings = await DisplaySettings.findOne()
    const blogOrder = settings?.blogOrder || []
    
    // Get all blogs
    const allBlogs = await Blog.find()
    
    // Create a map for quick lookup
    const blogMap = new Map(allBlogs.map(b => [b._id.toString(), b]))
    
    // Build ordered array: first ordered blogs, then any not in order
    const orderedBlogs = []
    const unorderedBlogs = []
    
    // Add blogs in specified order
    for (const blogId of blogOrder) {
      const blog = blogMap.get(blogId.toString())
      if (blog) {
        orderedBlogs.push(blog)
        blogMap.delete(blogId.toString())
      }
    }
    
    // Add remaining blogs (not in order list) sorted by createdAt
    unorderedBlogs.push(...Array.from(blogMap.values()))
    unorderedBlogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    res.json([...orderedBlogs, ...unorderedBlogs])
  } catch (error) {
    console.error('Get ordered blogs error:', error)
    res.status(500).json({ message: 'Error fetching blogs', error: error.message })
  }
})

module.exports = router

