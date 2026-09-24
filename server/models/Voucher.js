const mongoose = require('mongoose')

const VoucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, default: '' },
  discountType: { 
    type: String, 
    enum: ['percentage', 'fixed'], 
    default: 'percentage' 
  },
  discountValue: { type: Number, required: true }, // Percent or fixed amount
  minPurchaseAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number, default: null }, // For percentage discounts
  applicableTours: { type: [mongoose.Schema.Types.ObjectId], ref: 'Tour', default: [] }, // Empty = all tours
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: null }, // null = unlimited
  usageCount: { type: Number, default: 0 },
  userLimit: { type: Number, default: null }, // Max uses per user
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true })

// Index for active vouchers
VoucherSchema.index({ code: 1, active: 1 })
VoucherSchema.index({ validFrom: 1, validUntil: 1 })

module.exports = mongoose.model('Voucher', VoucherSchema)
