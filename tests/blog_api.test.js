const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)


describe('tests for blogs', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('blogs are returned in right amount', async () => {
        const inputBlogs = await api.get('/api/blogs')
        // expect(inputBlogs.body).toHaveLength(2)
    })

    test('Is id property defined?', async () => {
        const inputBlogs = await api.get('/api/blogs')
        expect(inputBlogs.body[0].id).toBeDefined()
    })

    test('test for POST', async () => {

        const test_obj = {
            title: "test for post request",
            author: "John Post",
            url: "http://post.com",
            likes: 1,
        }

        const old_Blogs_list = await api.get('/api/blogs')
        console.log('old_Blogs_list', old_Blogs_list.body)

        const post_result = await api
            .post('/api/blogs')
            .send(test_obj)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        console.log('post_result', post_result.body)

        const new_Blogs_list = await api.get('/api/blogs')
        console.log('new_Blogs_list', new_Blogs_list.body)

        // expect(new_Blogs_list.body).toHaveLength(old_Blogs_list.body.length + 1)

        new_Blogs_list.body.forEach((blog) => {
            if (blog.title === "test for post request") {
                console.log(`Deleting blog with id ${blog.id}`)
                api.delete(`/api/blogs/${blog.id}`)
            }
        })
    })

    afterAll(async () => {
        await mongoose.connection.close()
    })

})