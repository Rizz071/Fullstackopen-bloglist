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
        response.status(404).send("Not found!").end()
    }
})

blogsRouter.post('/', async (request, response) => {
    if (!request.body.likes) request.body.likes = 0

    if (!request.body.title) {
        response.status(400).send("Title is empty!").end()
    } else if (!request.body.url) {
        response.status(400).send("URL is empty!").end()
    } else {


        const blog = new Blog(request.body)
        const user = await User.findById(request.body.user)
        console.log('blog arrived by POST:', blog)
        console.log('Extracted USER:', user)

        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        const savedUser = await user.save()

        response.status(201).json(savedBlog)
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