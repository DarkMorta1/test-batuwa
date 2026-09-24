const mongoose = require('mongoose')

const SEOSettingsSchema = new mongoose.Schema({
  page: { type: String, required: true, unique: true }, // 'home', 'tours', 'contact', etc.
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  metaKeywords: { type: [String], default: [] },
  ogTitle: { type: String, default: '' },
  ogDescription: { type: String, default: '' },
  ogImage: { type: String, default: '' },
  canonicalUrl: { type: String, default: '' },
  customSlug: { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('SEOSettings', SEOSettingsSchema)

