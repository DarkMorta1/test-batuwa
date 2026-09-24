const express = require('express')
const router = express.Router()
const Voucher = require('../models/Voucher')
const { requireAdmin } = require('./middleware')
const ActivityLog = require('../models/ActivityLog')

// List vouchers (admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const vouchers = await Voucher.find()
      .populate('applicableTours', 'title')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
    res.json(vouchers)
  } catch (error) {
    console.error('Get vouchers error:', error)
    res.status(500).json({ message: 'Error fetching vouchers', error: error.message })
  }
})

// Get single voucher (admin)
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
      .populate('applicableTours', 'title')
      .populate('createdBy', 'username')
    
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' })
    }
    
    res.json(voucher)
  } catch (error) {
    console.error('Get voucher error:', error)
    res.status(500).json({ message: 'Error fetching voucher', error: error.message })
  }
})

// Create voucher (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const body = { ...req.body }
    if (body._id === '' || body._id === null) delete body._id
    
    // Ensure code is uppercase
    if (body.code) body.code = body.code.toUpperCase()
    
    body.createdBy = req.admin.id
    const voucher = await Voucher.create(body)

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'create',
      resource: 'voucher',
      resourceId: voucher._id,
      details: `Created voucher: ${voucher.code}`
    })

    res.status(201).json(voucher)
  } catch (error) {
    console.error('Create voucher error:', error)
    res.status(500).json({ message: 'Error creating voucher', error: error.message })
  }
})

// Update voucher
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' })
    }

    const updates = req.body
    if (updates.code) updates.code = updates.code.toUpperCase()
    
    Object.assign(voucher, updates)
    await voucher.save()

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'update',
      resource: 'voucher',
      resourceId: voucher._id,
      details: `Updated voucher: ${voucher.code}`
    })

    res.json(voucher)
  } catch (error) {
    console.error('Update voucher error:', error)
    res.status(500).json({ message: 'Error updating voucher', error: error.message })
  }
})

// Delete voucher
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' })
    }

    await Voucher.findByIdAndDelete(req.params.id)

    // Log activity
    await ActivityLog.create({
      adminId: req.admin.id,
      adminUsername: req.admin.username,
      action: 'delete',
      resource: 'voucher',
      resourceId: req.params.id,
      details: `Deleted voucher: ${voucher.code}`
    })

    res.json({ success: true, message: 'Voucher deleted successfully' })
  } catch (error) {
    console.error('Delete voucher error:', error)
    res.status(500).json({ message: 'Error deleting voucher', error: error.message })
  }
})

// Public: validate voucher code
router.post('/validate', async (req, res) => {
  try {
    const { code, tourId, amount } = req.body
    if (!code) return res.status(400).json({ message: 'Missing code' })

    const voucher = await Voucher.findOne({ 
      code: code.toUpperCase(),
      active: true
    }).populate('applicableTours', '_id')

    if (!voucher) {
      return res.status(404).json({ valid: false, message: 'Invalid voucher code' })
    }

    // Check if voucher is expired
    const now = new Date()
    if (voucher.validFrom > now || voucher.validUntil < now) {
      return res.status(400).json({ valid: false, message: 'Voucher has expired' })
    }

    // Check usage limit
    if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
      return res.status(400).json({ valid: false, message: 'Voucher usage limit reached' })
    }

    // Check if tour is applicable
    if (tourId && voucher.applicableTours.length > 0) {
      const isApplicable = voucher.applicableTours.some(t => t._id.toString() === tourId)
      if (!isApplicable) {
        return res.status(400).json({ valid: false, message: 'Voucher not applicable for this tour' })
      }
    }

    // Check minimum purchase amount
    if (amount && voucher.minPurchaseAmount && amount < voucher.minPurchaseAmount) {
      return res.status(400).json({ 
        valid: false, 
        message: `Minimum purchase amount is ${voucher.minPurchaseAmount}` 
      })
    }

    // Calculate discount
    let discount = 0
    if (voucher.discountType === 'percentage') {
      discount = (amount * voucher.discountValue) / 100
      if (voucher.maxDiscountAmount) {
        discount = Math.min(discount, voucher.maxDiscountAmount)
      }
    } else {
      discount = voucher.discountValue
    }

    res.json({ 
      valid: true, 
      discount,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue
    })
  } catch (error) {
    console.error('Validate voucher error:', error)
    res.status(500).json({ message: 'Error validating voucher', error: error.message })
  }
})

module.exports = router
