const express = require('express')
const {check,validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()

const User = require('../modals/User')
const auth = require('../middleware/auth')

const JWT_EXPIRES = process.env.JWT_EXPIRES
const JWT_SECRET = process.env.JWT_SECRET

/**
 * @method POST
 * @param /signup
 * @description User Signup
 */

 router.post('/signup',
            [
                check("username","Please enter a valid username")
                .not().isEmpty(),
                check("email","Please enter a valid email").not().isEmpty(),
                check("password","please enter a valid password").isLength({
                    min:6
                })
            ],
            async(req,res) => { 
                const errors = validationResult(req);
                if(!errors.isEmpty()){
                    return res.status(400).json({
                        errors:errors.array()
                    })
                }
                const {
                    username,
                    email,
                    password
                } = req.body

                try {
                    let user = await User.findOne({
                        email
                    })
                    if(user){
                        return res.status(400).json({
                            msg:"User Already Exists"
                        })
                    }

                    user = new User({
                        username,
                        email,
                        password
                    })

                    const salt = await bcrypt.genSalt(10)
                    user.password = await bcrypt.hash(password,salt)

                    await user.save()

                    const payload = {
                        user:{
                            id:user.id
                        }
                    }

                    jwt.sign(payload,JWT_SECRET,{
                        expiresIn:JWT_EXPIRES
                    },(err,token) => {
                        if(err) throw(err)
                        res.status(201).json({
                            token
                        })
                    })
                } catch (error) {
                    console.log(error.message)
                    res.status(500).send("Error in Saving")
                }
            }
)

router.post('/login',[
    check("email","please enter a valid email").isEmail(),
    check("password","please enter a valid password").isLength({
        min:6
    })
],async(req,res) => { 
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors:errors.array()
        })
    }

    const {email,password} = req.body
    try {
        let user = await User.findOne({email})
        if(!user) { 
            return res.status(400).json({
                msg:"User does not exists"
            })
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch) { 
            return res.status(400).json({
                msg:"incorrect password"
            })
        }
        
        const payload = { 
            user:{ 
                user: user.id
            }
        }
        
        jwt.sign(payload,JWT_SECRET,{expiresIn:JWT_EXPIRES},(err,token) => {
            if(err){
                throw(err)
            }
            res.status(200).json({
                token
            })
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:"Server Error"
        })
    }
})

router.get('/me',auth,async(req,res) => { 
    try {
        console.log('user',req.user)
        const user = await User.findById(req.user.id).select('-password')
        console.log('user',user)
        res.json(user)
    } catch (error) {
        console.log(error)
        res.send({message:"Error in user fetching"})
    }
})

module.exports = router