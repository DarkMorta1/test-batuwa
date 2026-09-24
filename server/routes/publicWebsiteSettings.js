const express = require('express')
const router = express.Router()
const WebsiteSettings = require('../models/WebsiteSettings')

router.get('/', async (req, res) => {
  try {
    const settings = await WebsiteSettings.getSettings()
    res.json({
      siteName: settings.siteName,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      whatsappNumber: settings.whatsappNumber,
      address: settings.address,
      googleMapsUrl: settings.googleMapsUrl,
      socialLinks: settings.socialLinks
    })
  } catch (error) {
    console.error('Get public website settings error:', error)
    res.status(500).json({ message: 'Error fetching public website settings' })
  }
})

module.exports = router