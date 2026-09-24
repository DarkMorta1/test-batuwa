const express = require('express')
const router = express.Router()
const Tour = require('../models/Tour')
const { requireAdmin } = require('./middleware')
const ActivityLog = require('../models/ActivityLog')

// list tours (public - only published)
router.get('/', async (req, res) => {
  try {
    const { status, featured, trending, upcoming } = req.query
    const query = {}
    
    // Check if request is from admin (has authorization header)
    const isAdmin = !!req.headers.authorization
    
    // For public route, only show published tours
    // For admin (with auth), allow filtering by status or status=all to get all tours
    if (!isAdmin) {
      query.status = 'published'
    } else if (status && status !== 'all') {
      query.status = status
    }
    
    if (featured === 'true') query.featured = true
    if (trending === 'true') query.trending = true
    if (upcoming === 'true') query.upcoming = true

    const tours = await Tour.find(query).sort({ createdAt: -1 })
    
    // Log for debugging
    if (!isAdmin) {
      console.log(`[Public API] Returning ${tours.length} published tours`)
    }
    
    res.json(tours)
  } catch (error) {
    console.error('Get tours error:', error)
    res.status(500).json({ message: 'Error fetching tours', error: error.message })
  }
})

// GET /api/tours/:id - Get single tour
router.get('/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' })
    }
    
    // Increment views
    tour.views = (tour.views || 0) + 1
    await tour.save()
    
    res.json(tour)
  } catch (error) {
    console.error('Get tour error:', error)
    res.status(500).json({ message: 'Error fetching tour', error: error.message })
  }
})

// create tour (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const body = { ...req.body }
    if (body._id === '' || body._id === null) delete body._id
    
    const tour = await Tour.create(body)

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'create',
      resource: 'tour',
      resourceId: tour._id,
      details: `Created tour: ${tour.title}`
    })

    res.status(201).json(tour)
  } catch (error) {
    console.error('Create tour error:', error)
    res.status(500).json({ message: 'Error creating tour', error: error.message })
  }
})

// update
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' })
    }

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'update',
      resource: 'tour',
      resourceId: tour._id,
      details: `Updated tour: ${tour.title}`
    })

    res.json(tour)
  } catch (error) {
    console.error('Update tour error:', error)
    res.status(500).json({ message: 'Error updating tour', error: error.message })
  }
})

// delete
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' })
    }

    await Tour.findByIdAndDelete(req.params.id)

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'delete',
      resource: 'tour',
      resourceId: req.params.id,
      details: `Deleted tour: ${tour.title}`
    })

    res.json({ success: true, message: 'Tour deleted successfully' })
  } catch (error) {
    console.error('Delete tour error:', error)
    res.status(500).json({ message: 'Error deleting tour', error: error.message })
  }
})

module.exports = router
