const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  passwordHash: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isBlocked: { type: Boolean, default: false },
  avatar: { type: String, default: '' },
  preferences: {
    notifications: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false }
  }
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)

