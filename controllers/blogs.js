const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({})
        .populate('user', { username: 1, name: 1 })

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


    const user = await User.findById(request.body.userId)
    const blog = new Blog(request.body)

    const savedBlog = await blog.save()
    user.notes = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
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