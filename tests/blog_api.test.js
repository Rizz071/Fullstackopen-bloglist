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
        expect(inputBlogs.body).toHaveLength(2)
    })

    afterAll(async () => {
        await mongoose.connection.close()
    })

})