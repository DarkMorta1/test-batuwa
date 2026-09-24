const mongoose = require('mongoose')

const BannerSettingsSchema = new mongoose.Schema({
  images: [{
    type: String,
    required: true
  }],
  title: {
    type: String,
    default: 'TRAVEL WITH BATUWA'
  },
  eyebrow: {
    type: String,
    default: 'Travel'
  },
  rotationInterval: {
    type: Number,
    default: 4000 // milliseconds
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

module.exports = mongoose.model('BannerSettings', BannerSettingsSchema)

