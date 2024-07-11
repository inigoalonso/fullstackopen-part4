const config = require('./utils/config')
const express = require('express')
const cors = require('cors')
require('express-async-errors')
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()

// Setup mongoose to use the MongoDB connection
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

// Middleware
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

// Define the tokenExtractor middleware
app.use(middleware.tokenExtractor)

// Define the testing route handler
if (process.env.NODE_ENV === 'test') {
  console.log('Loading testing routes')
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

// Route handlers
app.use('/api/blogs', middleware.userExtractor, blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

// Define the root route handler
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

// Error handling middleware
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)
module.exports = app