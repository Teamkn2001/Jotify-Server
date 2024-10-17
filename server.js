require('dotenv').config()
const express = require('express')
const cors = require('cors')
const authRoute = require('./routes/auth-route')
const notFound = require('./middlewares/not-found')
const errorMiddleware = require('./middlewares/error-middleware')
const authenticate = require('./middlewares/authenticate')
const userRoute = require('./routes/user-route')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoute)

app.use('/user',authenticate, userRoute)

app.use(notFound)
app.use(errorMiddleware)

const port = process.env.PORT
app.listen(port , console.log(`running on port ${port}`))