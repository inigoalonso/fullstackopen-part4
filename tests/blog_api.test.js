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

  test('the unique identifier property of blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body
    blogs.forEach(blog => {
      assert.strictEqual(blog.hasOwnProperty('id'), true, 'Blog post should have an id property')
      assert.strictEqual(blog.hasOwnProperty('_id'), false, 'Blog post should not have an _id property')

    })
  })

  test('a valid blog post can be added', async () => {
    const newBlog = {
      title: 'An interesting blog post',
      author: 'Linus',
      url: 'http://example.com/interesting',
      likes: 1985
    }

    // Get initial blogs count
    const initialBlogs = await api.get('/api/blogs')
    const initialLength = initialBlogs.body.length

    // Post a new blog
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    // Get blogs after adding a new one
    const response = await api.get('/api/blogs')
    const blogsAtEnd = response.body

    // Verify the number of blogs increased by one
    assert.strictEqual(blogsAtEnd.length, initialLength + 1)

    // Verify the content of the blog post
    const titles = blogsAtEnd.map(blog => blog.title)
    assert(titles.includes(newBlog.title))

    // Delete the added blog post
    const addedBlog = blogsAtEnd.find(blog => blog.title === newBlog.title)
    await api.delete(`/api/blogs/${addedBlog.id}`).expect(204)

    // Verify the number of blogs is back to the initial count
    const finalBlogs = await api.get('/api/blogs')
    assert.strictEqual(finalBlogs.body.length, initialLength)
  })
})

after(async () => {
  await mongoose.connection.close()
})