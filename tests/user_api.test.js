const { test, beforeEach, after, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

describe('userApi', () => {

  beforeEach(async () => {
    await User.deleteMany({})
  })

  test('a user can be added', async () => {
    const validUser = {
      username: 'user',
      name: 'User',
      password: 'password'
    }

    const response = await api
      .post('/api/users')
      .send(validUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.username, validUser.username)
  })

  test('creation fails if username already exists', async () => {
    const newUser = {
      username: 'user',
      name: 'User',
      password: 'password'
    }

    await api.post('/api/users').send(newUser).expect(201)

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.error, 'unique username needed')
  })

  test('creation fails if username is < 3 characters long', async () => {
    const shortUser = {
      username: 'us',
      name: 'User',
      password: 'password'
    }

    const response = await api
      .post('/api/users')
      .send(shortUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.error, 'both username and password need to be > 3 characters long')
  })

  test('creation fails if password is < 3 characters long', async () => {
    const shortPasswordUser = {
      username: 'user',
      name: 'User',
      password: 'pw'
    }

    const response = await api
      .post('/api/users')
      .send(shortPasswordUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.error, 'both username and password need to be > 3 characters long')
  })

  test('creation fails if username is missing', async () => {
    const noUsernameUser = {
      name: 'User',
      password: 'password'
    }

    const response = await api
      .post('/api/users')
      .send(noUsernameUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.error, 'both username and password needed')
  })

  test('creation fails if password is missing', async () => {
    const noPasswordUser = {
      username: 'username',
      name: 'User'
    }

    const response = await api
      .post('/api/users')
      .send(noPasswordUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.error, 'both username and password needed')
  })

})

after(async () => {
  await mongoose.connection.close()
})
