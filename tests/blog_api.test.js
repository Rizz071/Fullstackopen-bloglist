const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const usersRouter = require('../controllers/users')


const api = supertest(app)


let loggedUser = undefined

const initialUsers = [
    {
        "username": "testuser1",
        "name": "Esi Merkki",
        "password": "salasana1"
    },
    {
        "username": "testuser2",
        "name": "Esi Merkki",
        "password": "salasana2"
    }
]

const initialBlogs = [
    {
        title: "test for post request 0",
        author: "John Post",
        url: "http://post.com",
        likes: 1,
        // user: undefined
    },
    {
        title: "test for post request 1",
        author: "Dave Repost",
        url: "http://post.com",
        likes: 10,
        // user: undefined
    }
]


beforeEach(async () => {
    // Deleting all dummy user entities
    await User.deleteMany({})

    const saltRounds = 10

    // Creating dummy user entities
    for (let dummyUser of initialUsers) {
        let userObject = new User(dummyUser)
        userObject.passwordHash = await bcrypt.hash(dummyUser.password, saltRounds)

        await userObject.save()
    }

    // const createdUsers = await api.get('/api/users')
    // console.log('Created dummy users:', createdUsers.body)


    // Deleting all dummy blog entities
    await Blog.deleteMany({})

    const user = await User.findOne({ username: 'testuser1' })

    // console.log('Creating dummy blog entities...')
    for (let dummyBlog of initialBlogs) {
        let blogObject = new Blog(dummyBlog)
        blogObject.user = user.id
        await blogObject.save()
    }

    // const createdBlogs = await api.get('/api/blogs')
    // console.log('Created dummy blogs:', createdBlogs.body)
})


describe('tests for users', () => {
    describe('tests for user creation', () => {

        test('test for POST', async () => {

            const old_Users_list = await api
                .get('/api/users')

            const sentUser = await api
                .post('/api/users')
                .send({
                    "username": "testuser3",
                    "name": "Esi Merkki",
                    "password": "salasana3"
                })
                .expect(201)
                .expect('Content-Type', /application\/json/)

            console.log('sentUser id', sentUser.body)

            const new_Users_list = await api.get('/api/users')
            console.log('new_Users_list.body', new_Users_list.body)
            expect(new_Users_list.body).toHaveLength(old_Users_list.body.length + 1)
            expect(new_Users_list.body[2].id).toBe(sentUser.body.id)
        })

        test('test for too short username', async () => {

            const sentUser = await api
                .post('/api/users')
                .send({
                    "username": "Jo",
                    "name": "Esi Merkki",
                    "password": "salasana"
                })
                .expect(400)

            const new_Users_list = await api.get('/api/users')
            expect(new_Users_list.body).not.toContain(sentUser)
        })

        test('test for too short password', async () => {

            const sentUser = await api
                .post('/api/users')
                .send({
                    "username": "Jonny",
                    "name": "Esi Merkki",
                    "password": "sa"
                })
                .expect(401)

            const new_Users_list = await api.get('/api/users')
            expect(new_Users_list.body).not.toContain(sentUser)
        })

        test('creating new user with empty username -> 401', async () => {
            const sentUser = await api
                .post('/api/users')
                .send({
                    "username": "",
                    "name": "Esi Merkki",
                    "password": "salasana"
                })
                .expect(400)
        })

        test('creating new user with empty password -> 401', async () => {
            const sentUser = await api
                .post('/api/users')
                .send({
                    "username": "Jonny",
                    "name": "Esi Merkki",
                    "password": ""
                })
                .expect(401)
        })

        test('creating new user with undefined username-> 400', async () => {
            const sentUser = await api
                .post('/api/users')
                .send({
                    "username": undefined,
                    "name": "Esi Merkki",
                    "password": "salasana"
                })
                .expect(400)
        })

        test('creating new user with undefined password-> 401', async () => {
            const sentUser = await api
                .post('/api/users')
                .send({
                    "username": "Jonny",
                    "name": "Esi Merkki",
                    "password": undefined
                })
                .expect(401)
        })
    })

})


describe('tests for authorization', () => {

    test('login without token', async () => {
        await api
            .post('/api/login')
            .send({
                "username": "testuser30",
                "password": "salasana"
            })
            .expect(401)
    })


    test('test for authorization of testuser2', async () => {
        console.log('logging in to post new blog')
        loggedUser = await api
            .post('/api/login')
            .set('Authorization', 'salasana2')
            .send({
                username: `testuser2`,
                password: `salasana2`
            })
            .expect(200)
        console.log('loggenUser.body: ', loggedUser.body)
    })
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


    describe('adding a blog', () => {
        test('test for POST', async () => {

            const old_Blogs_list = await api.get('/api/blogs')

            const user = await User.findOne({ username: `${loggedUser.body.username}` })
            // console.log('testuser2 id:', user.id)

            console.log('trying to create new post...')
            const sentBlog = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${loggedUser.body.token}`)
                .send({
                    title: "test for post request 3",
                    author: "Mike Defrost",
                    url: "http://post.com",
                    likes: 3,
                    user: user.id,
                })
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const new_Blogs_list = await api.get('/api/blogs')

            expect(new_Blogs_list.body).toHaveLength(old_Blogs_list.body.length + 1)
            expect(new_Blogs_list.body[2].id).toBe(sentBlog.body.id)
        })


        test('If the likes property is missing from the request, it will default to the value 0', async () => {

            const user = await User.findOne({ username: `${loggedUser.body.username}` })

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${loggedUser.body.token}`)
                .send({
                    title: "test for post request 4",
                    author: "test for likes value",
                    url: "http://post.com",
                    // likes: 3,
                    user: user.id
                })
                .expect(201)

            const blogList = await api.get('/api/blogs')
            console.log(blogList.body)

            blogList.body.forEach(blog => {
                expect(blog.likes).toBeDefined()
            })
        })

        test('If the title or url properties are missing from the request data, the backend responds to the request with the status code 400 Bad Request', async () => {

            const user = await User.findOne({ username: `${loggedUser.body.username}` })

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${loggedUser.body.token}`)
                .send({
                    // title: "test for post request 5",
                    author: "test title",
                    url: "http://post.com",
                    likes: 3,
                    user: user.id
                })
                .expect(400)

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${loggedUser.body.token}`)
                .send({
                    title: "test for post request 5",
                    author: "test url",
                    // url: "http://post.com",
                    likes: 3,
                    user: user.id
                })
                .expect(400)

            const blogList = await api.get('/api/blogs')
            console.log(blogList.body)
        })
    })


    describe('deletion of a blog', () => {
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
    })

    describe('updating of a blog', () => {
        test('If entity was updated properly?', async () => {
            const old_blogList = await api.get('/api/blogs')

            const user = await User.findOne({ username: `${loggedUser.body.username}` })

            //trying to update first dummy blog in list. Likes property is different
            const updatedBlog = {
                title: "test for post request 1",
                author: "Dave Repost",
                url: "http://post.com",
                likes: 100,
                id: old_blogList.body[1].id,
                user: user.id
            }

            await api
                .put(`/api/blogs/${updatedBlog.id}`)
                .set('Authorization', `Bearer ${loggedUser.body.token}`)
                .send(updatedBlog)
                .expect(200)

            const new_blogList = await api.get('/api/blogs')

            if (new_blogList.body[1].user.id === user.toJSON().id) {
                new_blogList.body[1].user = user.toJSON().id
            }

            expect(new_blogList.body[1]).toEqual(updatedBlog)
        })
    })

})

afterAll(async () => {
    await mongoose.connection.close()
    console.log('Connection to MongoDB closed')
})