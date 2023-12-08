const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')


const api = supertest(app)


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

beforeEach(async () => {
    console.log('Deleting all dummy user entities...')
    await User.deleteMany({})
    console.log('...deleted')

    const saltRounds = 10

    console.log('Creating dummy user entities...')
    for (let dummyUser of initialUsers) {
        let userObject = new User(dummyUser)
        userObject.passwordHash = await bcrypt.hash(dummyUser.password, saltRounds)

        await userObject.save()
    }
    console.log('...created')
})


describe('tests for users', () => {
    describe('tests for user creation', () => {

        test('test for POST', async () => {

            const old_Users_list = await api.get('/api/users')

            await api
                .post('/api/users')
                .send({
                    "username": "testuser3",
                    "name": "Esi Merkki",
                    "password": "salasana3"
                })
                .expect(201)

            const new_Users_list = await api.get('/api/users')
            console.log(new_Users_list.body)
            expect(new_Users_list.body).toHaveLength(old_Users_list.body.length + 1)
        })

        test('test for too short username', async () => {

            const old_Users_list = await api.get('/api/users')

            await api
                .post('/api/users')
                .send({
                    "username": "te",
                    "name": "Esi Merkki",
                    "password": "salasana3"
                })
                .expect(400)

            const new_Users_list = await api.get('/api/users')
            console.log(new_Users_list.body)
            expect(new_Users_list.body).toHaveLength(old_Users_list.body.length + 1)
        })
    })

})