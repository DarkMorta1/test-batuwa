require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

// Routes
const authRoutes = require('./routes/auth')
const blogRoutes = require('./routes/blogs')
const voucherRoutes = require('./routes/vouchers')
const tourRoutes = require('./routes/tours')
const reviewRoutes = require('./routes/reviews')
const uploadRoutes = require('./routes/upload')
const galleryRoutes = require('./routes/gallery')
const aboutRoutes = require('./routes/about')
const publicWebsiteSettingsRoutes = require('./routes/publicWebsiteSettings')

// Admin routes
const dashboardRoutes = require('./routes/dashboard')
const bookingRoutes = require('./routes/bookings')
const userRoutes = require('./routes/users')
const inquiryRoutes = require('./routes/inquiries')
const websiteSettingsRoutes = require('./routes/websiteSettings')
const seoSettingsRoutes = require('./routes/seoSettings')
const homepageContentRoutes = require('./routes/homepageContent')
const bannerSettingsRoutes = require('./routes/bannerSettings')
const themeSettingsRoutes = require('./routes/themeSettings')
const activityLogRoutes = require('./routes/activityLogs')
const displaySettingsRoutes = require('./routes/displaySettings')

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Serve uploaded images from client/public/images folder
app.use('/images', express.static(path.join(__dirname, '..', 'client', 'public', 'images')))

// Root route
app.get('/', (req, res) => {
  res.send('Backend is running successfully 🚀')
})

// Health check route (optional, good for monitoring)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' })
})

// Public routes
app.use('/api/auth', authRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/vouchers', voucherRoutes)
app.use('/api/tours', tourRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/about', aboutRoutes)
app.use('/api/website-settings', publicWebsiteSettingsRoutes)
app.use('/api/banner', bannerSettingsRoutes)
app.use('/api/display-settings', displaySettingsRoutes)

// Admin routes
app.use('/api/admin/dashboard', dashboardRoutes)
app.use('/api/admin/bookings', bookingRoutes)
app.use('/api/admin/users', userRoutes)
app.use('/api/admin/inquiries', inquiryRoutes)
app.use('/api/admin/website-settings', websiteSettingsRoutes)
app.use('/api/admin/seo', seoSettingsRoutes)
app.use('/api/admin/homepage-content', homepageContentRoutes)
app.use('/api/admin/banner', bannerSettingsRoutes)
app.use('/api/admin/theme', themeSettingsRoutes)
app.use('/api/admin/activity-logs', activityLogRoutes)
app.use('/api/admin/display-settings', displaySettingsRoutes)

const PORT = process.env.PORT || 4000

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
  })
  .catch(err => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })
