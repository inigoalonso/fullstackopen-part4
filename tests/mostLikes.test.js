const { test, describe } = require('node:test')
const assert = require('node:assert')

const listHelper = require('../utils/list_helper')

describe('mostLikes', () => {
  test('should return the author with the most likes', () => {
    const blogs = [
      { title: 'First Blog', author: 'Ada', likes: 10 },
      { title: 'Second Blog', author: 'Babbage', likes: 10 },
      { title: 'Third Blog', author: 'Ada', likes: 7 },
      { title: 'Fourth Blog', author: 'Charles', likes: 12 },
      { title: 'Fifth Blog', author: 'Babbage', likes: 1 }
    ]

    const result = listHelper.mostLikes(blogs)

    assert.deepStrictEqual(result, {
      author: 'Ada',
      likes: 17
    })
  })

  test('should return one of the authors with the highest likes if there are more than one', () => {
    const blogs = [
      { title: 'First Blog', author: 'Ada', likes: 10 },
      { title: 'Second Blog', author: 'Babbage', likes: 10 },
      { title: 'Third Blog', author: 'Ada', likes: 7 },
      { title: 'Fourth Blog', author: 'Babbage', likes: 9 },
      { title: 'Fifth Blog', author: 'Babbage', likes: 1 }
    ]

    const result = listHelper.mostLikes(blogs)

    assert.strictEqual(result.likes, 20)
    assert.ok(['Babbage'].includes(result.author))
  })

  test('should return null for an empty list', () => {
    const blogs = []

    const result = listHelper.mostLikes(blogs)

    assert.strictEqual(result, null)
  })
})
