const mongoose = require('mongoose')

const GallerySchema = new mongoose.Schema({
  path: { type: String, required: true },
  caption: { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('Gallery', GallerySchema)

