const { test, after, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

describe('blogApi', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, 2)
  })

  test('the first blog is about a white whale', async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map(e => e.title)
    // is the argument truthy
    assert(titles.includes('Moby Dick'))
  })
})

after(async () => {
  await mongoose.connection.close()
})