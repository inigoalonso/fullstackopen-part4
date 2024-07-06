const { test, describe } = require('node:test')
const assert = require('node:assert')

const listHelper = require('../utils/list_helper')

describe('favoriteBlog', () => {
  test('Should return the blog with the most likes', () => {
    const blogs = [
      { title: '1 Blog', author: 'Ada', likes: 3 },
      { title: '2 Blog', author: 'Babbage', likes: 9 },
      { title: '3 Blog', author: 'Charles', likes: 1 }
    ]

    const result = listHelper.favoriteBlog(blogs)

    assert.deepStrictEqual(result, {
      title: '2 Blog',
      author: 'Babbage',
      likes: 9
    })
  })

  test('If there are many top favorites, it is enough to return one of them.', () => {
    const blogs = [
      { title: '1 Blog', author: 'Ada', likes: 2 },
      { title: '2 Blog', author: 'Babbage', likes: 2 },
      { title: '3 Blog', author: 'Charles', likes: 1 }
    ]

    const result = listHelper.favoriteBlog(blogs)

    assert.strictEqual(result.likes, 2)
    assert.ok(['1 Blog', '2 Blog'].includes(result.title))
  })

  test('Should return null for an empty list', () => {
    const blogs = []

    const result = listHelper.favoriteBlog(blogs)

    assert.strictEqual(result, null)
  })
})
