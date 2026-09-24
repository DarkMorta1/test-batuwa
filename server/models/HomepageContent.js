const mongoose = require('mongoose')

const HomepageContentSchema = new mongoose.Schema({
  section: { type: String, required: true, unique: true }, // 'hero', 'about', 'popular-tours', 'reviews', 'gallery', 'blog', 'cta'
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 }, // For drag & drop ordering
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' },
  content: { type: String, default: '' }, // HTML/Rich text content
  image: { type: String, default: '' },
  video: { type: String, default: '' },
  ctaText: { type: String, default: '' },
  ctaLink: { type: String, default: '' },
  backgroundColor: { type: String, default: '' },
  textColor: { type: String, default: '' },
  customData: { type: mongoose.Schema.Types.Mixed, default: {} } // Flexible storage for section-specific data
}, { timestamps: true })

module.exports = mongoose.model('HomepageContent', HomepageContentSchema)

