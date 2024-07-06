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

  const author = Object.keys(authors).reduce((author, current) => {
    return (authors[current] > authors[author]) ? current : author
  }, Object.keys(authors)[0])

  return {
    author: author,
    blogs: authors[author]
  }
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs
}