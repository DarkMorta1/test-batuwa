const mongoose = require('mongoose')

function slugifyTitle(title = '') {
  return String(title)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'blog'
}

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, sparse: true },
  excerpt: { type: String, default: '' },
  thumb: { type: String, default: '' },
  date: { type: String, default: '' },
  author: { type: String, default: '' },
  content: { type: String, default: '' }
}, { timestamps: true })

BlogSchema.pre('validate', async function(next) {
  if (!this.title) return next()

  const base = slugifyTitle(this.title)
  let slug = base
  let counter = 1

  if (!this.slug || this.isModified('title')) {
    while (await mongoose.models.Blog.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${counter}`
      counter += 1
    }
    this.slug = slug
  }

  next()
})

module.exports = mongoose.model('Blog', BlogSchema)
