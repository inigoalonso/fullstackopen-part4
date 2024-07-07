const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response, next) => {
  try {
    const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1 })
    response.json(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body

  if (!username || !password) {
    return response.status(400).json({ error: 'both username and password needed' })
  }

  if (username.length < 3 || password.length < 3) {
    return response.status(400).json({ error: 'both username and password need to be > 3 characters long' })
  }

  const foundUser = await User.findOne({ username })
  if (foundUser) {
    return response.status(400).json({ error: 'unique username needed' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })
  try {
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter