const express = require('express')
const bodyParser = require('body-parser')
const user = require('./routes/user')
const dotenv = require('dotenv')
const InitiateMongoServer = require('./config/db')

dotenv.config()

//Initiate Mongo Server
InitiateMongoServer()

const app = express()

const PORT = process.env.PORT || 4000

app.use(bodyParser.json())

app.get('/',(req,res) => { 
    res.json({
        message:"API WORKING"
    })
})

/**
 * Router Middleware
 * Router - /user/
 * Method - *
 */
app.use('/user',user)

app.listen(PORT,(req,res) => { 
    console.log(`Server Started at Port ${PORT}`)
})