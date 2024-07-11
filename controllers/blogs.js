const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
// const User = require('../models/user')
// const jwt = require('jsonwebtoken')
const userExtractor = require('../utils/middleware').userExtractor

// const getTokenFrom = request => {
//   const authorization = request.get('authorization')
//   if (authorization && authorization.startsWith('Bearer ')) {
//     return authorization.replace('Bearer ', '')
//   }
//   return null
// }

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
  } catch (error) {
    next(error)
  }
})

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const blog = new Blog(request.body)

  const user = request.user

  if (!user ) {
    return response.status(403).json({ error: 'user missing' })
  }

  if (!blog.title || !blog.url ) {
    return response.status(400).json({ error: 'title or url missing' })
  }

  blog.likes = blog.likes | 0
  blog.user = user
  user.blogs = user.blogs.concat(blog._id)

  await user.save()

  const savedBlog = await blog.save()

  response.status(201).json(savedBlog)
})

// blogsRouter.post('/', async (request, response, next) => {
//   const body = request.body
//   const token = request.token
//   if (!token) {
//     return response.status(401).json({ error: 'token missing' })
//   }

//   const decodedToken = jwt.verify(token, process.env.SECRET)

//   if (!decodedToken.id) {
//     return response.status(401).json({ error: 'token invalid' })
//   }

//   const user = await User.findById(decodedToken.id)

//   if (!body.title || !body.url) {
//     return response.status(400).json({ error: 'Both title and url are needed' })
//   }

//   try {
//     const blog = new Blog({
//       title: body.title,
//       author: user.name,
//       url: body.url,
//       likes: body.likes || 0,
//       user: user._id,
//     })
//     const savedBlog = await blog.save()
//     user.blogs = user.blogs.concat(savedBlog._id)
//     await user.save()
//     response.status(201).json(savedBlog)
//   } catch (error) {
//     next(error)
//   }
// })

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    const user = request.user

    if (!user) {
      return response.status(401).json({ error: 'token invalid' })
    }

    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(404).json({ error: 'blog not found' })
    }

    if (blog.user.toString() !== user._id.toString()) {
      return response.status(403).json({ error: 'permission denied' })
    }

    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
    // Also remove it from the list of blogs of the user
    user.blogs = user.blogs.filter(b => b.toString() !== request.params.id)
    await user.save()
  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: body.user,
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter
