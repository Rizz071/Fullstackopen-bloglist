const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


blogsRouter.get('/', async (request, response) => {
    if (request.token === undefined) {
        return response.status(401).json({ error: "Token absent or invalid" })
    }

    const blogs = await Blog
        .find({})
        .populate('user', { username: 1, name: 1 })

    if (blogs) {
        return response.json(blogs)
    } else {
        return response.status(404).json({ error: "Not found!" })
    }
})

blogsRouter.post('/', async (request, response) => {
    if (!request.body.likes) request.body.likes = 0
    request.body.comments = []

    if (!request.body.title) {
        return response.status(400).json({ error: "Title is empty!" })
    } else if (!request.body.url) {
        return response.status(400).json({ error: "URL is empty!" })
    } else if (request.token === undefined) {
        return response.status(401).json({ error: "Token absent or invalid" })
    } else {

        console.log('Received decodedToken from middleware', request.token)

        const user = await User.findOne({ username: request.token.username })
        console.log('Extracted USER:', user)

        const blog = new Blog(request.body)
        console.log('Blog arrived by POST:', blog)

        blog.user = user.id

        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        const savedUser = await user.save()

        return response.status(201).json(savedBlog)
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    const result = await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
    console.log(`Entity with id ${request.params.id} was deleted`)
})

blogsRouter.put('/:id', async (request, response) => {
    if (!request.body.likes) request.body.likes = 0
    if (!request.body.title) response.status(400).end()
    if (!request.body.url) response.status(400).end()

    const blog = new Blog(request.body)

    const result = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(200).json(result)
})

module.exports = blogsRouter