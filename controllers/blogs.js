const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})

    if (blogs) {
        response.json(blogs)
    } else {
        response.status(404).end()
    }
})

blogsRouter.post('/', async (request, response) => {
    if (!request.body.likes) request.body.likes = 0
    if (!request.body.title) response.status(400).end()
    if (!request.body.url) response.status(400).end()

    const blog = new Blog(request.body)

    const result = await blog.save()
    response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {
    const result = await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
    console.log(`Entity with id ${request.params.id} was deleted`)
})

module.exports = blogsRouter