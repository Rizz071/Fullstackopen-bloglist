const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs')
    response.json(users)
})


usersRouter.post('/', async (request, response) => {
    // const { username, name, password } = request.body

    if (request.body.password.length < 3) response.status(401)

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(request.body.password, saltRounds)

    const user = new User({
        username: request.body.username,
        name: request.body.name,
        passwordHash: passwordHash
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

module.exports = usersRouter