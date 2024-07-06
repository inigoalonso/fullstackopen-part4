const { test, describe } = require('node:test')
const assert = require('node:assert')

const listHelper = require('../utils/list_helper')

describe('mostBlogs', () => {
  test('should return the author with the most blogs', () => {
    const blogs = [
      { title: 'First Blog', author: 'Ada', likes: 5 },
      { title: 'Second Blog', author: 'Babbage', likes: 10 },
      { title: 'Third Blog', author: 'Ada', likes: 7 },
      { title: 'Fourth Blog', author: 'Ada', likes: 2 },
      { title: 'Fifth Blog', author: 'Babbage', likes: 8 }
    ]

    const result = listHelper.mostBlogs(blogs)

    assert.deepStrictEqual(result, {
      author: 'Ada',
      blogs: 3
    })
  })

  test('should return one of the authors with the highest number of blogs if there are more than one', () => {
    const blogs = [
      { title: 'First Blog', author: 'Ada', likes: 5 },
      { title: 'Second Blog', author: 'Babbage', likes: 10 },
      { title: 'Third Blog', author: 'Ada', likes: 7 },
      { title: 'Fourth Blog', author: 'Babbage', likes: 2 },
      { title: 'Fifth Blog', author: 'Charles', likes: 8 }
    ]

    const result = listHelper.mostBlogs(blogs)

    assert.strictEqual(result.blogs, 2)
    assert.ok(['Ada', 'Babbage'].includes(result.author))
  })

  test('should return null for an empty list', () => {
    const blogs = []

    const result = listHelper.mostBlogs(blogs)

    assert.strictEqual(result, null)
  })
})
