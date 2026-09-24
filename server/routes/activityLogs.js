const express = require('express')
const router = express.Router()
const { requireAdmin } = require('./middleware')
const ActivityLog = require('../models/ActivityLog')

// GET /api/admin/activity-logs
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, resource, adminId } = req.query
    const query = {}
    
    if (resource) query.resource = resource
    if (adminId) query.adminId = adminId

    const logs = await ActivityLog.find(query)
      .populate('adminId', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await ActivityLog.countDocuments(query)

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Get activity logs error:', error)
    res.status(500).json({ message: 'Error fetching activity logs', error: error.message })
  }
})

module.exports = router

