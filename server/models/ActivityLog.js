const mongoose = require('mongoose')

const ActivityLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  adminUsername: { type: String, required: true },
  action: { type: String, required: true }, // 'create', 'update', 'delete', 'login', 'logout'
  resource: { type: String, required: true }, // 'tour', 'booking', 'user', 'settings', etc.
  resourceId: { type: mongoose.Schema.Types.Mixed },
  details: { type: String, default: '' },
  changes: { type: mongoose.Schema.Types.Mixed }, // Before/after values
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' }
}, { timestamps: true })

// Index for faster queries
ActivityLogSchema.index({ adminId: 1, createdAt: -1 })
ActivityLogSchema.index({ resource: 1, createdAt: -1 })

module.exports = mongoose.model('ActivityLog', ActivityLogSchema)

