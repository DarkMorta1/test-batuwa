const express = require('express')
const router = express.Router()
const { requireAdmin } = require('./middleware')
const User = require('../models/User')
const Booking = require('../models/Booking')
const ActivityLog = require('../models/ActivityLog')

// GET /api/admin/users - Get all users
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isBlocked } = req.query
    const query = {}
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true'

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Error fetching users', error: error.message })
  }
})

// GET /api/admin/users/:id
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Get user's bookings
    const bookings = await Booking.find({ userId: req.params.id })
      .populate('tourId', 'title img')
      .sort({ createdAt: -1 })

    res.json({ user, bookings })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Error fetching user', error: error.message })
  }
})

// PUT /api/admin/users/:id/block - Block/unblock user
router.put('/:id/block', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.isBlocked = !user.isBlocked
    await user.save()

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: user.isBlocked ? 'block' : 'unblock',
      resource: 'user',
      resourceId: user._id,
      details: `${user.isBlocked ? 'Blocked' : 'Unblocked'} user ${user.email}`
    })

    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user })
  } catch (error) {
    console.error('Block user error:', error)
    res.status(500).json({ message: 'Error updating user', error: error.message })
  }
})

// PUT /api/admin/users/:id/role - Change user role
router.put('/:id/role', requireAdmin, async (req, res) => {
  try {
    const { role } = req.body
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const oldRole = user.role
    user.role = role
    await user.save()

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'update',
      resource: 'user',
      resourceId: user._id,
      details: `Changed user role from ${oldRole} to ${role}`,
      changes: { role: { from: oldRole, to: role } }
    })

    res.json({ message: 'User role updated successfully', user })
  } catch (error) {
    console.error('Update user role error:', error)
    res.status(500).json({ message: 'Error updating user role', error: error.message })
  }
})

// DELETE /api/admin/users/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await User.findByIdAndDelete(req.params.id)

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'delete',
      resource: 'user',
      resourceId: req.params.id,
      details: `Deleted user ${user.email}`
    })

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Error deleting user', error: error.message })
  }
})

module.exports = router

