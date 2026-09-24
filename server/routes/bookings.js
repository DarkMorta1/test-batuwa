const express = require('express')
const router = express.Router()
const { requireAdmin } = require('./middleware')
const Booking = require('../models/Booking')
const Tour = require('../models/Tour')
const ActivityLog = require('../models/ActivityLog')

// GET /api/admin/bookings - Get all bookings with filters
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query
    const query = {}
    
    if (status) query.status = status
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { tourTitle: { $regex: search, $options: 'i' } }
      ]
    }

    const bookings = await Booking.find(query)
      .populate('tourId', 'title img')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Booking.countDocuments(query)

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    res.status(500).json({ message: 'Error fetching bookings', error: error.message })
  }
})

// GET /api/admin/bookings/:id
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tourId')
      .populate('userId')

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    res.json(booking)
  } catch (error) {
    console.error('Get booking error:', error)
    res.status(500).json({ message: 'Error fetching booking', error: error.message })
  }
})

// POST /api/admin/bookings - Create manual booking
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      tourId,
      customerName,
      customerEmail,
      customerPhone,
      numberOfTravelers,
      travelDate,
      totalAmount,
      discountAmount,
      voucherCode,
      specialRequests,
      notes
    } = req.body

    const tour = await Tour.findById(tourId)
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' })
    }

    const booking = await Booking.create({
      tourId,
      tourTitle: tour.title,
      customerName,
      customerEmail,
      customerPhone,
      numberOfTravelers,
      travelDate,
      totalAmount,
      discountAmount,
      voucherCode,
      specialRequests,
      notes,
      status: 'approved',
      paymentStatus: 'paid'
    })

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'create',
      resource: 'booking',
      resourceId: booking._id,
      details: `Created manual booking for ${customerName}`
    })

    res.status(201).json(booking)
  } catch (error) {
    console.error('Create booking error:', error)
    res.status(500).json({ message: 'Error creating booking', error: error.message })
  }
})

// PUT /api/admin/bookings/:id - Update booking
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    const oldStatus = booking.status
    const updates = req.body
    
    Object.assign(booking, updates)
    await booking.save()

    // Log activity
    if (updates.status && updates.status !== oldStatus) {
      await ActivityLog.create({
        adminId: req.admin.id,
        adminUsername: req.admin.username,
        action: 'update',
        resource: 'booking',
        resourceId: booking._id,
        details: `Changed booking status from ${oldStatus} to ${updates.status}`,
        changes: { status: { from: oldStatus, to: updates.status } }
      })
    }

    res.json(booking)
  } catch (error) {
    console.error('Update booking error:', error)
    res.status(500).json({ message: 'Error updating booking', error: error.message })
  }
})

// DELETE /api/admin/bookings/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    await Booking.findByIdAndDelete(req.params.id)

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'delete',
      resource: 'booking',
      resourceId: req.params.id,
      details: `Deleted booking for ${booking.customerName}`
    })

    res.json({ message: 'Booking deleted successfully' })
  } catch (error) {
    console.error('Delete booking error:', error)
    res.status(500).json({ message: 'Error deleting booking', error: error.message })
  }
})

// GET /api/admin/bookings/export/csv - Export bookings as CSV
router.get('/export/csv', requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('tourId', 'title')
      .sort({ createdAt: -1 })

    const csvHeader = 'Date,Booking ID,Customer Name,Email,Phone,Tour,Travelers,Travel Date,Total Amount,Status,Payment Status\n'
    const csvRows = bookings.map(b => {
      return [
        new Date(b.createdAt).toISOString().split('T')[0],
        b._id,
        b.customerName,
        b.customerEmail,
        b.customerPhone,
        b.tourTitle,
        b.numberOfTravelers,
        new Date(b.travelDate).toISOString().split('T')[0],
        b.totalAmount,
        b.status,
        b.paymentStatus
      ].join(',')
    }).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv')
    res.send(csvHeader + csvRows)
  } catch (error) {
    console.error('Export bookings error:', error)
    res.status(500).json({ message: 'Error exporting bookings', error: error.message })
  }
})

module.exports = router

