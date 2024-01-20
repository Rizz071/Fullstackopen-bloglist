const commentsRouter = require('express').Router()
const Comment = require('../models/comment')
const Blog = require('../models/blog')
const User = require('../models/user')


commentsRouter.get('/:blogId', async (request, response) => {

    const Comments = await Comment
        .find({})
        .populate('user', { username: 1, name: 1 })
        .populate('blog')

    // console.log('All comments: ', Comments[0].blog)
    // console.log(request.params.blogId)

    const foundedComments = Comments.filter(comment => {
        console.log(comment)
        return comment.blog.id === request.params.blogId
    })

    // console.log('Founded comments by blog id: ', foundedComments)


    if (foundedComments) {
        return response.json(foundedComments)
    } else {
        return response.status(404).json({ error: "Not found!" })
    }
})


commentsRouter.post('/:blogId', async (request, response) => {

    if (!request.body.comment) {
        return response.status(400).json({ error: "Comment is empty!" })
    } else if (!request.params.blogId) {
        return response.status(400).json({ error: "Blog ID is empty!" })
    } else {

        const comment = new Comment(request.body)

        const blog = await Blog.findOne({ _id: request.params.blogId })
        // console.log('Blog founded', blog)

        comment.blog = blog

        // console.log('Commentr arrived by POST:', comment)

        console.log('Received decodedToken from middleware1', request.token)

        const user = await User.findOne({ username: request.token.username })

        comment.user = user
        // console.log(user)
        // comment.user.id = user.id

        const savedComment = await comment.save()

        // console.log('Responce from server:', savedComment)
        return response.status(201).json(savedComment)
    }
})


commentsRouter.delete('/:commentId', async (request, response) => {


    const result = await Comment.findByIdAndDelete(request.params.commentId)

    // console.log('Received decodedToken from middleware', request.token)
    response.status(200).json(result)
    console.log(`Comment with id ${request.params.commentId} was deleted`)
})


module.exports = commentsRouter