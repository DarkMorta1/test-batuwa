const mongoose = require('mongoose')

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  tourTitle: { type: String, required: true }, // Snapshot for historical data
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  numberOfTravelers: { type: Number, required: true, default: 1 },
  travelDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  voucherCode: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'], 
    default: 'pending' 
  },
  specialRequests: { type: String, default: '' },
  notes: { type: String, default: '' } // Admin notes
}, { timestamps: true })

module.exports = mongoose.model('Booking', BookingSchema)

