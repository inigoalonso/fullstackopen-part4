// testing_api.test.js
const { test, after, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

describe('testingApi', () => {
  test('resetting the database', async () => {
    await api
      .post('/api/testing/reset')
      .expect(204)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 0)

    const users = await api.get('/api/users')
    assert.strictEqual(users.body.length, 0)
  })
})

after(async () => {
  await mongoose.connection.close()
})
