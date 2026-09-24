const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { 
    type: String, 
    required: true,
    unique: true,
    sparse: true // Allows handling of unique constraint properly
  },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['super_admin', 'admin', 'editor'], 
    default: 'admin' 
  },
  fullName: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  lastLoginIp: { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('Admin', AdminSchema)
