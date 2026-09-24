const mongoose = require('mongoose')

const ThemeSettingsSchema = new mongoose.Schema({
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  primaryColor: { type: String, default: '#3B82F6' },
  secondaryColor: { type: String, default: '#8B5CF6' },
  accentColor: { type: String, default: '#F59E0B' },
  backgroundColor: { type: String, default: '#FFFFFF' },
  textColor: { type: String, default: '#1F2937' },
  headingFont: { type: String, default: 'Inter' },
  bodyFont: { type: String, default: 'Inter' },
  buttonStyle: { 
    type: String, 
    enum: ['rounded', 'square', 'pill'], 
    default: 'rounded' 
  },
  buttonSize: { 
    type: String, 
    enum: ['small', 'medium', 'large'], 
    default: 'medium' 
  },
  themeMode: { 
    type: String, 
    enum: ['light', 'dark', 'auto'], 
    default: 'light' 
  },
  customCSS: { type: String, default: '' }
}, { timestamps: true })

// Ensure only one theme settings document exists
ThemeSettingsSchema.statics.getTheme = async function() {
  let theme = await this.findOne()
  if (!theme) {
    theme = await this.create({})
  }
  return theme
}

module.exports = mongoose.model('ThemeSettings', ThemeSettingsSchema)

