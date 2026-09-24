const mongoose = require('mongoose')

const InquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  status: { 
    type: String, 
    enum: ['new', 'read', 'replied', 'archived'], 
    default: 'new' 
  },
  adminNotes: { type: String, default: '' },
  repliedAt: { type: Date },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true })

module.exports = mongoose.model('Inquiry', InquirySchema)

