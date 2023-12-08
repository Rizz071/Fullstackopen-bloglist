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


    test('If the likes property is missing from the request, it will default to the value 0', async () => {
        await api
            .post('/api/blogs')
            .send({
                title: "test for post request 4",
                author: "test for likes value",
                url: "http://post.com",
                // likes: 3,
            })
            .expect(201)

        const blogList = await api.get('/api/blogs')
        console.log(blogList.body)

        blogList.body.forEach(blog => {
            expect(blog.likes).toBeDefined()
        })

    })

    test('If the title or url properties are missing from the request data, the backend responds to the request with the status code 400 Bad Request', async () => {
        await api
            .post('/api/blogs')
            .send({
                // title: "test for post request 5",
                author: "test title",
                url: "http://post.com",
                likes: 3,
            })
            .expect(400)

        await api
            .post('/api/blogs')
            .send({
                title: "test for post request 5",
                author: "test url",
                // url: "http://post.com",
                likes: 3,
            })
            .expect(400)

        const blogList = await api.get('/api/blogs')
        console.log(blogList.body)
    })

    test('If entity was delete properly?', async () => {
        const old_blogList = await api.get('/api/blogs')
        // console.log('blogs before deletion', old_blogList.body)

        await api.del(`/api/blogs/${old_blogList.body[0].id}`)

        const new_blogList = await api.get('/api/blogs')
        // console.log('blogs after deletion', new_blogList.body)
        new_blogList.body.forEach(blog => {
            expect(blog.id).not.toBe(old_blogList.body[0].id)
        })
    })


    test('If entity was updated properly?', async () => {
        const old_blogList = await api.get('/api/blogs')
        // console.log('first dummy in list blog before updating', old_blogList.body[0])

        //trying to update first dummy blog in list. Likes property is different
        const updatedBlog = {
            title: 'test for post request 0',
            author: 'John Post',
            url: 'http://post.com',
            likes: 100,
            id: old_blogList.body[0].id,
        }

        await api
            .put(`/api/blogs/${old_blogList.body[0].id}`)
            .send(updatedBlog)
            .expect(200)

        const new_blogList = await api.get('/api/blogs')
        // console.log('dummy blog after updating', new_blogList.body[0])

        expect(new_blogList.body[0]).toEqual(updatedBlog)
    })

    afterAll(async () => {
        await mongoose.connection.close()
        console.log('Connection to MongoDB closed')
    })

})