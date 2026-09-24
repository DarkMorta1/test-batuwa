const mongoose = require('mongoose')
const Tour = require('../models/Tour')
require('dotenv').config()

async function checkTours() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set in .env')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB\n')

  try {
    const tours = await Tour.find().sort({ createdAt: -1 })
    
    console.log(`Total tours in database: ${tours.length}\n`)
    
    if (tours.length === 0) {
      console.log('No tours found in database.')
      process.exit(0)
    }

    console.log('Tour Status Breakdown:')
    const statusCounts = {}
    tours.forEach(tour => {
      statusCounts[tour.status] = (statusCounts[tour.status] || 0) + 1
    })
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })

    console.log('\nAll Tours:')
    tours.forEach((tour, index) => {
      console.log(`\n${index + 1}. ${tour.title}`)
      console.log(`   Status: ${tour.status}`)
      console.log(`   Trending: ${tour.trending ? 'Yes' : 'No'}`)
      console.log(`   Upcoming: ${tour.upcoming ? 'Yes' : 'No'}`)
      console.log(`   Featured: ${tour.featured ? 'Yes' : 'No'}`)
      console.log(`   ID: ${tour._id}`)
    })

    const publishedTours = tours.filter(t => t.status === 'published')
    console.log(`\n✅ Published tours: ${publishedTours.length}`)
    console.log(`❌ Non-published tours: ${tours.length - publishedTours.length}`)

    if (publishedTours.length === 0) {
      console.log('\n⚠️  WARNING: No published tours found!')
      console.log('   Tours need to be set to "published" status to appear on the frontend.')
      console.log('   You can either:')
      console.log('   1. Edit tours in admin panel and set status to "published"')
      console.log('   2. Run: node server/scripts/publishAllTours.js (to publish all tours)')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

checkTours().catch(console.error)

