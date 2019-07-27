const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Task = require("../models/task")

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email not valid")
            }
        } 
    },
    password:{
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error('Password can\'t contain "Password" string')
            }
        }
    },  
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value<0){
                throw new Error("Age cannot be negative")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField :'_id',
    foreignField :'owner'
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = await jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    // console.log("these are user tokens ",user.tokens)
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email: email})
    console.log("inside credentials ",user)
    if(!user){
        throw new Error("Unable to login")
    }
    const isMatch = await bcrypt.compare(password, user.password)
    console.log("match hai ",isMatch)
    if(!isMatch){
        throw new Error("Unable to login")
    }
    return user
}

userSchema.pre('save', async function(next){
    var user = this
    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
        console.log("hashing", user.password)    
    }
    next(); 
})

userSchema.pre('remove', async function(next){
    var user = this
    await Task.deleteMany({owner: user._id})
    next(); 
})

const User = mongoose.model("User",userSchema)
User.createIndexes()

module.exports = User