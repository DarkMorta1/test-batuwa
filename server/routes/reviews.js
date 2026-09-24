const express = require('express')
const router = express.Router()
const Review = require('../models/Review')
const { requireAdmin } = require('./middleware')
const ActivityLog = require('../models/ActivityLog')

// list reviews (supports optional ?tour=<id>&approved=true&featured=true&hidden=false)
router.get('/', async (req, res) => {
  try {
    const q = {}
    if (req.query.tour) q.tourId = req.query.tour
    if (typeof req.query.approved !== 'undefined') q.approved = String(req.query.approved) === 'true'
    if (typeof req.query.featured !== 'undefined') q.featured = String(req.query.featured) === 'true'
    if (typeof req.query.hidden !== 'undefined') q.hidden = String(req.query.hidden) === 'false'
    
    // For public, only show approved and not hidden reviews
    if (!req.headers.authorization) {
      q.approved = true
      q.hidden = false
    }
    
    const reviews = await Review.find(q)
      .populate('tourId', 'title img')
      .sort({ createdAt: -1 })
    res.json(reviews)
  } catch (error) {
    console.error('Get reviews error:', error)
    res.status(500).json({ message: 'Error fetching reviews', error: error.message })
  }
})

// public: add review (unapproved by default). If Authorization header present, mark approved.
router.post('/', async (req, res) => {
  try {
    const body = { ...req.body }
    if (body._id === '' || body._id === null) delete body._id
    // if admin posts with auth header, set approved true
    body.approved = !!req.headers.authorization
    const review = await Review.create(body)
    res.status(201).json(review)
  } catch (error) {
    console.error('Create review error:', error)
    res.status(500).json({ message: 'Error creating review', error: error.message })
  }
})

// admin: update review (approve/unapprove, edit, feature, hide)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    const updates = req.body
    const oldApproved = review.approved
    const oldHidden = review.hidden
    const oldFeatured = review.featured

    // If editing message, store original in editedMessage
    if (updates.message && updates.message !== review.message) {
      updates.editedMessage = updates.message
      updates.isEdited = true
      updates.editedBy = req.admin.id
    }

    Object.assign(review, updates)
    await review.save()

    // Log activity
    let activityDetails = `Updated review by ${review.author}`
    if (updates.approved !== undefined && updates.approved !== oldApproved) {
      activityDetails = `${updates.approved ? 'Approved' : 'Unapproved'} review by ${review.author}`
    } else if (updates.featured !== undefined && updates.featured !== oldFeatured) {
      activityDetails = `${updates.featured ? 'Featured' : 'Unfeatured'} review by ${review.author}`
    } else if (updates.hidden !== undefined && updates.hidden !== oldHidden) {
      activityDetails = `${updates.hidden ? 'Hidden' : 'Unhidden'} review by ${review.author}`
    }

    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'update',
      resource: 'review',
      resourceId: review._id,
      details: activityDetails
    })

    res.json(review)
  } catch (error) {
    console.error('Update review error:', error)
    res.status(500).json({ message: 'Error updating review', error: error.message })
  }
})

// admin: delete review
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    await Review.findByIdAndDelete(req.params.id)

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'delete',
      resource: 'review',
      resourceId: req.params.id,
      details: `Deleted review by ${review.author}`
    })

    res.json({ success: true, message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Delete review error:', error)
    res.status(500).json({ message: 'Error deleting review', error: error.message })
  }
})

module.exports = router
