const express = require('express')
const router = express.Router()
const Gallery = require('../models/Gallery')
const { requireAdmin } = require('./middleware')

// List gallery items (public)
router.get('/', async (req, res) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 })
    res.json(items)
  } catch (error) {
    console.error('Get gallery error:', error)
    res.status(500).json({ message: 'Error fetching gallery', error: error.message })
  }
})

// Delete gallery item (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  await Gallery.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

module.exports = router

