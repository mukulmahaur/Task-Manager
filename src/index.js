const express = require("express")
require("./db/mongoose")
const User = require("./models/user")
const Task = require("./models/task")
const bcrypt = require("bcrypt")


const userRoute = require("./routers/user")
const taskRoute = require("./routers/task")

const app = express()
const port = process.env.PORT

// app.use((req,res,next)=>{
//     res.status(503).send("Site is under Maintainance")
// })

const multer = require('multer')
const upload = multer({
    dest: 'images',
    limits: {
        fileSize : 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(doc|docx)$/)){
            return cb(new Error('Please Upload a doc file'))
        }
        cb(undefined,true)
    }
})

app.post('/upload', upload.single('upload'),(req,res)=>{
    res.send("trying wala upload")
},(error, req, res, next)=>{
    res.status(400).send({ error: error.message})
})

app.use(express.json())
app.use(userRoute)
app.use(taskRoute)

app.listen(port,()=>{
    console.log("server is up on "+port)
})

// const jwt = require("jsonwebtoken")

// const myFunction = async ()=>{
//     // const token = jwt.sign({_id:"Mukul is the key"},"thisismykey",{"expiresIn":"2 seconds"})
//     // console.log(token)
//     // const hashed = await bcrypt.hash("ramanshu",8)
//     // console.log("ye hash hai ",await bcrypt.hash("ramanshu",8))
//     // console.log(await bcrypt.compare("ramanshu",hashed))

//     // const user = await User.findById("5d348ccf302aca4ed15cde1b")
//     // await user.populate('tasks').execPopulate()
//     // console.log(user.tasks)
// }
// myFunction()