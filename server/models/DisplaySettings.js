const mongoose = require('mongoose')

const DisplaySettingsSchema = new mongoose.Schema({
  tourOrder: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour'
  }],
  blogOrder: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }]
}, { timestamps: true })

module.exports = mongoose.model('DisplaySettings', DisplaySettingsSchema)

