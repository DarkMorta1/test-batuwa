const express = require('express')
const router = express.Router()
const { requireAdmin } = require('./middleware')
const Inquiry = require('../models/Inquiry')
const ActivityLog = require('../models/ActivityLog')

// GET /api/admin/inquiries - Get all inquiries
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query
    const query = {}
    
    if (status) query.status = status
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ]
    }

    const inquiries = await Inquiry.find(query)
      .populate('tourId', 'title')
      .populate('repliedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Inquiry.countDocuments(query)

    res.json({
      inquiries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Get inquiries error:', error)
    res.status(500).json({ message: 'Error fetching inquiries', error: error.message })
  }
})

// GET /api/admin/inquiries/:id
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('tourId')
      .populate('repliedBy', 'username')

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' })
    }

    res.json(inquiry)
  } catch (error) {
    console.error('Get inquiry error:', error)
    res.status(500).json({ message: 'Error fetching inquiry', error: error.message })
  }
})

// PUT /api/admin/inquiries/:id/status - Update inquiry status
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body
    const inquiry = await Inquiry.findById(req.params.id)
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' })
    }

    const oldStatus = inquiry.status
    inquiry.status = status
    
    if (status === 'replied') {
      inquiry.repliedAt = new Date()
      inquiry.repliedBy = req.admin.id
    }
    
    if (adminNotes) inquiry.adminNotes = adminNotes
    
    await inquiry.save()

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'update',
      resource: 'inquiry',
      resourceId: inquiry._id,
      details: `Changed inquiry status from ${oldStatus} to ${status}`,
      changes: { status: { from: oldStatus, to: status } }
    })

    res.json(inquiry)
  } catch (error) {
    console.error('Update inquiry error:', error)
    res.status(500).json({ message: 'Error updating inquiry', error: error.message })
  }
})

// DELETE /api/admin/inquiries/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' })
    }

    await Inquiry.findByIdAndDelete(req.params.id)

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'delete',
      resource: 'inquiry',
      resourceId: req.params.id,
      details: `Deleted inquiry from ${inquiry.email}`
    })

    res.json({ message: 'Inquiry deleted successfully' })
  } catch (error) {
    console.error('Delete inquiry error:', error)
    res.status(500).json({ message: 'Error deleting inquiry', error: error.message })
  }
})

module.exports = router

