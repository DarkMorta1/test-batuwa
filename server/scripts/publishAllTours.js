const mongoose = require('mongoose')
const Tour = require('../models/Tour')
require('dotenv').config()

async function publishAllTours() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set in .env')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB\n')

  try {
    const result = await Tour.updateMany(
      { status: { $ne: 'published' } },
      { $set: { status: 'published' } }
    )
    
    console.log(`✅ Updated ${result.modifiedCount} tours to "published" status`)
    
    if (result.modifiedCount === 0) {
      console.log('   All tours are already published, or no tours exist.')
    } else {
      console.log('\n   Tours are now visible on the frontend!')
    }

    // Show summary
    const totalTours = await Tour.countDocuments()
    const publishedTours = await Tour.countDocuments({ status: 'published' })
    console.log(`\nTotal tours: ${totalTours}`)
    console.log(`Published tours: ${publishedTours}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

publishAllTours().catch(console.error)

