const mongoose = require('mongoose')

const InitiateMongoServer = async () =>  { 
    try {
        await mongoose.connect(process.env.MONGO_URL,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
        console.log('connected to db')
    } catch (error) {
        console.log(error)
        throw(error)
    }
}

module.exports = InitiateMongoServer