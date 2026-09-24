const express = require('express')
const router = express.Router()
const HomepageContent = require('../models/HomepageContent')

router.get('/', async (req, res) => {
  try {
    const content = await HomepageContent.findOne({ section: 'about-us', enabled: true }).lean()
    if (!content) return res.status(404).json({ message: 'About Us content is not available' })
    res.json(content)
  } catch (error) {
    console.error('Get About Us content error:', error)
    res.status(500).json({ message: 'Error fetching About Us content' })
  }
})

module.exports = router