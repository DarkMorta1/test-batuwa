require('dotenv').config()
const mongoose = require('mongoose')
const Admin = require('./models/Admin')

async function migrate() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not set in .env')
      process.exit(1)
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    // Find all admins without email
    const adminsWithoutEmail = await Admin.find({ $or: [{ email: { $exists: false } }, { email: null }, { email: '' }] })
    
    if (adminsWithoutEmail.length === 0) {
      console.log('All admins already have email addresses')
      await mongoose.disconnect()
      process.exit(0)
    }

    console.log(`Found ${adminsWithoutEmail.length} admin(s) without email. Updating...`)

    for (const admin of adminsWithoutEmail) {
      // Generate email from username if not exists
      const email = `${admin.username}@batwatravels.com`
      
      // Check if this email already exists
      const emailExists = await Admin.findOne({ email, _id: { $ne: admin._id } })
      if (emailExists) {
        // If email exists, use a numbered version
        let counter = 1
        let newEmail = `${admin.username}${counter}@batwatravels.com`
        while (await Admin.findOne({ email: newEmail, _id: { $ne: admin._id } })) {
          counter++
          newEmail = `${admin.username}${counter}@batwatravels.com`
        }
        admin.email = newEmail
      } else {
        admin.email = email
      }
      
      await admin.save()
      console.log(`Updated admin "${admin.username}" with email: ${admin.email}`)
    }

    console.log('Migration completed successfully')
    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Migration error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

migrate()

