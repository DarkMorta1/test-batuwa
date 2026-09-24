const mongoose = require('mongoose')

const ItineraryDaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true }, // Day 1, Day 2, etc.
  title: { type: String, required: true }, // e.g., "Day 1 – Arrival & City Tour"
  description: { type: String, required: true }, // Detailed description of activities, places, meals, stay
  day: { type: Number }, // Keep for backward compatibility - will be auto-set from dayNumber
}, { _id: false })

// Auto-set day from dayNumber for backward compatibility
ItineraryDaySchema.pre('save', function(next) {
  if (this.dayNumber && !this.day) {
    this.day = this.dayNumber
  }
  next()
})

const SeasonalPricingSchema = new mongoose.Schema({
  season: { type: String, required: true }, // 'peak', 'off-peak', 'shoulder'
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  price: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 }
}, { _id: false })

const TourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  img: { type: String, required: true },
  desc: { type: String, required: true },
  fullDescription: { type: String, default: '' },
  price: { type: Number, required: true, default: 0 },
  showPrice: { type: Boolean, default: true },
  discountPrice: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  days: { type: Number, required: true, default: 1 },
  nights: { type: Number, default: 0 },
  location: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'moderate', 'challenging', 'expert'], 
    default: 'moderate' 
  },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'hidden'], 
    default: 'draft' 
  },
  trending: { type: Boolean, default: false },
  upcoming: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  photos: { type: [String], default: [] },
  videos: { type: [String], default: [] },
  mapUrl: { type: String, default: '' },
  maxGroupSize: { type: Number, default: 15 },
  minGroupSize: { type: Number, default: 2 },
  includes: { type: [String], default: [] },
  excludes: { type: [String], default: [] },
  itinerary: { type: [ItineraryDaySchema], default: [] },
  seasonalPricing: { type: [SeasonalPricingSchema], default: [] },
  details: {
    expenses: { type: String, default: '' },
    cancellationPolicy: { type: String, default: '' },
    highlights: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    furtherInfo: { type: mongoose.Schema.Types.Mixed, default: '' }
  },
  views: { type: Number, default: 0 },
  bookings: { type: Number, default: 0 }
}, { timestamps: true })

// Auto-generate slug from title
TourSchema.pre('save', async function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  next()
})

module.exports = mongoose.model('Tour', TourSchema)
