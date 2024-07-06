require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

// Parse JSON bodies (as sent by API clients)
app.use(express.json())

// Define the URL for the MongoDB database
const url = process.env.MONGODB_URI
// const mongoUrl = 'mongodb://localhost/bloglist'
mongoose.connect(url)

app.use(cors())
app.use(express.json())

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/blogs', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

app.post('/api/blogs', (request, response, next) => {
  try {
    const blog = new Blog(request.body)
    console.log('blog:', blog)
    blog
      .save()
      .then(result => {
        response.status(201).json(result)
      })
      .catch((error) => next(error))
  } catch (error) {
    next(error) // Forward to error handling middleware
  }
})

// Error handler middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})