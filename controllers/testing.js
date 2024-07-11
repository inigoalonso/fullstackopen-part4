const router = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

router.post('/reset', async (request, response, next) => {
  try {
    console.log('resetting database')
    await Blog.deleteMany({})
    await User.deleteMany({})

    response.status(204).end()
  }
  catch (exception) {
    next(exception)
  }
})

module.exports = router