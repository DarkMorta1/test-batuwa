const mongoose = require('mongoose')

const WebsiteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Batwa Travels' },
  siteTagline: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  googleMapsUrl: { type: String, default: '' },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: 'We are currently under maintenance. Please check back soon.' },
  bookingEnabled: { type: Boolean, default: true },
  currency: { type: String, default: 'USD' },
  currencySymbol: { type: String, default: 'RS' },
  timezone: { type: String, default: 'UTC' }
}, { timestamps: true })

// Ensure only one settings document exists
WebsiteSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne()
  if (!settings) {
    settings = await this.create({})
  }
  return settings
}

module.exports = mongoose.model('WebsiteSettings', WebsiteSettingsSchema)

