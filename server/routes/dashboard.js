const express = require('express')
const router = express.Router()
const { requireAdmin } = require('./middleware')
const Booking = require('../models/Booking')
const Tour = require('../models/Tour')
const User = require('../models/User')
const Inquiry = require('../models/Inquiry')
const Review = require('../models/Review')

// GET /api/admin/dashboard/stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalBookings,
      totalTours,
      publishedTours,
      hiddenTours,
      pendingBookings,
      approvedBookings,
      cancelledBookings,
      pendingInquiries,
      pendingReviews,
      approvedReviews
    ] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Tour.countDocuments(),
      Tour.countDocuments({ status: 'published' }),
      Tour.countDocuments({ status: 'hidden' }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'approved' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Inquiry.countDocuments({ status: 'new' }),
      Review.countDocuments({ approved: false }),
      Review.countDocuments({ approved: true })
    ])

    // Calculate revenue (sum of approved bookings)
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])
    const totalRevenue = revenueResult[0]?.total || 0

    // Monthly revenue for last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('tourId', 'title img')
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      stats: {
        totalUsers,
        totalBookings,
        totalTours,
        publishedTours,
        hiddenTours,
        pendingBookings,
        approvedBookings,
        cancelledBookings,
        pendingInquiries,
        pendingReviews,
        approvedReviews,
        totalRevenue
      },
      monthlyRevenue,
      recentBookings
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message })
  }
})

module.exports = router

