const express = require('express')
const router = express.Router()
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../cloudinary')
const Gallery = require('../models/Gallery')
const { requireAdmin } = require('./middleware')

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: process.env.CLOUDINARY_FOLDER || 'batwa-trip',
    resource_type: 'image',
    format: undefined // keep original format
  })
})

// File filter for basic image validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'))
  }
  cb(null, true)
}

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
})

// POST /api/upload - admin only
router.post('/', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    // Cloudinary URL (secure URL preferred)
    const publicPath = req.file.path || (req.file.secure_url || req.file.url)
    if (!publicPath) {
      return res.status(500).json({ message: 'Failed to obtain image URL from Cloudinary' })
    }

    // Save to gallery collection
    const galleryItem = new Gallery({ path: publicPath, caption: req.file.originalname })
    await galleryItem.save()
    
    res.json({ path: publicPath })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: error.message || 'Upload failed' })
  }
})

module.exports = router
