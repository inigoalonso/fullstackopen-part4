const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

// const blogSchema = new mongoose.Schema({
//   title: String,
//   author: String,
//   url: String,
//   likes: Number
// })

// const Blog = mongoose.model('Blog', blogSchema)

// Define the URL for the MongoDB database
const url = config.MONGODB_URI

mongoose.set('strictQuery', false)

logger.info('connecting to', url)

mongoose.connect(url)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })



app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

// app.get('/api/blogs', (request, response) => {
//   Blog
//     .find({})
//     .then(blogs => {
//       response.json(blogs)
//     })
// })

// app.post('/api/blogs', (request, response, next) => {
//   try {
//     const blog = new Blog(request.body)
//     console.log('blog:', blog)
//     blog
//       .save()
//       .then(result => {
//         response.status(201).json(result)
//       })
//       .catch((error) => next(error))
//   } catch (error) {
//     next(error) // Forward to error handling middleware
//   }
// })
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app