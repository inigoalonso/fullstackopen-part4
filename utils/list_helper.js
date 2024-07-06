const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  return blogs.reduce((favorite, current) => {
    return (current.likes > favorite.likes) ? current : favorite
  }, blogs[0])
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const authors = blogs.reduce((authors, blog) => {
    if (authors[blog.author]) {
      authors[blog.author]++
    } else {
      authors[blog.author] = 1
    }
    return authors
  }, {})

  const mostProlificAuthor = Object.keys(authors).reduce((author, current) => {
    return (authors[current] > authors[author]) ? current : author
  }, Object.keys(authors)[0])

  return {
    author: mostProlificAuthor,
    blogs: authors[mostProlificAuthor]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const authorLikes = blogs.reduce((likes, blog) => {
    likes[blog.author] = (likes[blog.author] || 0) + blog.likes
    return likes
  }, {})

  const mostLikedAuthor = Object.keys(authorLikes).reduce((top, author) => {
    return (authorLikes[author] > authorLikes[top]) ? author : top
  })

  return {
    author: mostLikedAuthor,
    likes: authorLikes[mostLikedAuthor]
  }
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}