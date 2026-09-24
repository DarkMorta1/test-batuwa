const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
  author: { type: String, required: true },
  email: { type: String, default: '' },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5, 
    default: 5 
  },
  message: { type: String, required: true },
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  tourTitle: { type: String, default: '' }, // Snapshot
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approved: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  editedMessage: { type: String, default: '' }, // Admin-edited version
  isEdited: { type: Boolean, default: false },
  photos: { type: [String], default: [] },
  verifiedPurchase: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Review', ReviewSchema)
