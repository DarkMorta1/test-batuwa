const express = require('express')
const router = express.Router()
const Blog = require('../models/Blog')
const { requireAdmin } = require('./middleware')

function slugifyTitle(title = '') {
  return String(title)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'blog'
}

async function generateUniqueBlogSlug(title, excludeId = null) {
  const base = slugifyTitle(title)
  let slug = base
  let counter = 1

  while (await Blog.exists({ slug, _id: { $ne: excludeId } })) {
    slug = `${base}-${counter}`
    counter += 1
  }

  return slug
}

// Public: list blogs
router.get('/', async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 })
  res.json(blogs)
})

// Admin: create blog
router.post('/', requireAdmin, async (req, res) => {
  const data = { ...req.body }
  if (data._id === '' || data._id === null) delete data._id

  if (data.title) {
    data.slug = await generateUniqueBlogSlug(data.title, data._id || null)
  }

  const blog = new Blog(data)
  await blog.save()
  res.json(blog)
})

// Admin: edit
router.put('/:id', requireAdmin, async (req, res) => {
  const existing = await Blog.findById(req.params.id)
  if (!existing) {
    return res.status(404).json({ message: 'Blog not found' })
  }

  const updateData = { ...req.body }
  if (updateData._id === '' || updateData._id === null) delete updateData._id
  if (updateData.title) {
    updateData.slug = await generateUniqueBlogSlug(updateData.title, req.params.id)
  }

  const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
  res.json(blog)
})

// Admin: delete
router.delete('/:id', requireAdmin, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

module.exports = router
