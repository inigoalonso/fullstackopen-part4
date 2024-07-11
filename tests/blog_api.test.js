const { test, after, describe, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const User = require('../models/user')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')


const api = supertest(app)

let token = ''
let testUserId = ''

beforeEach(async () => {
  // Clear the DB
  await User.deleteMany({})
  await Blog.deleteMany({})

  // Create a test user
  const saltRounds = 10
  const passwordHash = await bcrypt.hash('password', saltRounds)

  const testUser = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash: passwordHash,
  })

  const savedUser = await testUser.save()
  testUserId = savedUser._id

  // Generate a token for the test user
  const userForToken = {
    username: savedUser.username,
    id: testUserId,
  }

  token = jwt.sign(userForToken, process.env.SECRET)

  // console.log('Test user created:', savedUser)
  // console.log('Token:', token)

  // Create to dummy blog posts
  const blogObjects = [
    {
      title: 'First blog post',
      author: 'John Doe',
      url: 'http://example.com/first',
      likes: 10,
    },
    {
      title: 'Second blog post',
      author: 'Jane Doe',
      url: 'http://example.com/second',
      likes: 20,
    },
  ]
  // post the two blogs
  let blogObject = new Blog(blogObjects[0])
  blogObject.user = testUserId
  await blogObject.save()
  blogObject = new Blog(blogObjects[1])
  blogObject.user = testUserId
  await blogObject.save()

})

describe('blogApi', () => {

  describe('Retrieving blogs', () => {
    test('blogs are returned as JSON', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('there are two blogs initially', async () => {
      const response = await api.get('/api/blogs')
      assert.strictEqual(response.body.length, 2)
    })

    test('the unique identifier property of blog posts is named id', async () => {
      const response = await api.get('/api/blogs')
      const blogs = response.body
      blogs.forEach(blog => {
        assert.strictEqual(Object.prototype.hasOwnProperty.call(blog, 'id'), true, 'Blog post should have an id property')
        assert.strictEqual(Object.prototype.hasOwnProperty.call(blog, '_id'), false, 'Blog post should not have an _id property')

      })
    })
  })

  describe('Adding blogs', () => {
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
        .set('Authorization', `Bearer ${token}`)
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
      await api.delete(`/api/blogs/${addedBlog.id}`).set('Authorization', `Bearer ${token}`).expect(204)

      // Verify the number of blogs is back to the initial count
      const finalBlogs = await api.get('/api/blogs')
      assert.strictEqual(finalBlogs.body.length, initialLength)
    })

    test('if the likes property is missing, it defaults to 0', async () => {
      const newBlog = {
        title: 'A boring blog post',
        author: 'Anonymous',
        url: 'http://example.com/boring',
      // no likes sent
      }

      // Post a new blog
      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      // Verify the likes property defaults to 0
      const savedBlog = response.body
      assert.strictEqual(savedBlog.likes, 0)

      // Delete the added blog post
      await api.delete(`/api/blogs/${savedBlog.id}`).set('Authorization', `Bearer ${token}`).expect(204)
    })

    test('a blog without a title property returns status 400 Bad Request', async () => {
      const newBlog = {
        author: 'Iñigo Alonso Fernandez',
        url: 'http://example.com/urlsisnotmissing',
        likes: 23
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)
    })

    test('a blog without a url property returns status 400 Bad Request', async () => {
      const newBlog = {
        title: 'Title is not missing',
        author: 'Iñigo Alonso Fernandez',
        likes: 45
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)
    })

    test('adding a blog without a token fails with status code 401', async () => {
      const newBlog = {
        title: 'Sneaky post',
        author: 'Who knows',
        url: 'http://example.com/sneaky',
        likes: 0
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
    })
  })

  describe('Deleting blogs', () => {
    test('a single blog post can be deleted', async () => {
      const newBlog = {
        title: 'Rubish',
        author: 'Pariah',
        url: 'http://example.com/rubish',
        likes: 0
      }

      // Add a new blog to ensure there is one to delete
      const addedBlog = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      // Delete the newly added blog
      await api
        .delete(`/api/blogs/${addedBlog.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      // Verify the blog is actually deleted
      const response = await api.get('/api/blogs')
      const blogsAfterDeletion = response.body

      const titles = blogsAfterDeletion.map(blog => blog.title)
      assert(!titles.includes(newBlog.title))
    })
  })

  describe('Updating blogs', () => {
    test('a blog post can be updated', async () => {
      const newBlog = {
        title: 'Before',
        author: 'Original',
        url: 'http://example.com/before',
        likes: 0
      }

      // Add a new blog to make sure there is something to update
      const addedBlog = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const updatedBlog = {
        title: 'After',
        author: 'New gal',
        url: 'http://example.com/after',
        likes: 42
      }

      // Update the newly added blog
      const response = await api
        .put(`/api/blogs/${addedBlog.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      // Verify the blog is actually updated with the new content
      const updatedBlogResponse = response.body
      assert.strictEqual(updatedBlogResponse.title, updatedBlog.title)
      assert.strictEqual(updatedBlogResponse.author, updatedBlog.author)
      assert.strictEqual(updatedBlogResponse.url, updatedBlog.url)
      assert.strictEqual(updatedBlogResponse.likes, updatedBlog.likes)

      // Delete the updated blog post
      await api.delete(`/api/blogs/${updatedBlogResponse.id}`).set('Authorization', `Bearer ${token}`).expect(204)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})