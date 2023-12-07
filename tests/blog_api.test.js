const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
    {
        title: "test for post request 0",
        author: "John Post",
        url: "http://post.com",
        likes: 1,
    },
    {
        title: "test for post request 1",
        author: "Dave Repost",
        url: "http://post.com",
        likes: 10,
    }
]

beforeEach(async () => {
    console.log('Deleting all dummy entities...')
    await Blog.deleteMany({})
    console.log('...deleted')

    console.log('Creating dummy entities...')
    for (let dummyBlog of initialBlogs) {
        let blogObject = new Blog(dummyBlog)
        await blogObject.save()
    }
    console.log('...created')
})



describe('tests for blogs', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('blogs are returned in right amount', async () => {
        const inputBlogs = await api.get('/api/blogs')
        expect(inputBlogs.body).toHaveLength(2)
    })

    test('Is id property defined?', async () => {
        const inputBlogs = await api.get('/api/blogs')
        expect(inputBlogs.body[0].id).toBeDefined()
    })

    test('test for POST', async () => {

        const old_Blogs_list = await api.get('/api/blogs')

        await api
            .post('/api/blogs')
            .send({
                title: "test for post request 3",
                author: "Mike Defrost",
                url: "http://post.com",
                likes: 3,
            })
            .expect(201)

        const new_Blogs_list = await api.get('/api/blogs')
        console.log(new_Blogs_list.body)
        expect(new_Blogs_list.body).toHaveLength(old_Blogs_list.body.length + 1)
    })

    afterAll(async () => {
        await mongoose.connection.close()
        console.log('Connection to MongoDB closed')
    })

})