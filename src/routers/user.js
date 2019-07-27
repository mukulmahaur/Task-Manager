const express = require("express")
const multer = require('multer')
const User = require("../models/user")
const {sendWelcomeEmail, sendCancellationMail} = require("../emails/account")
const router = express.Router()
const auth = require("../middleware/auth")
const sharp = require("sharp")

router.post('/users',async (req, res)=>{
    const user = new User(req.body)
    // console.log(user)
    // user.password = await bcrypt.hash(user.password,8)
    try{
        await user.save()
        sendWelcomeEmail(user.name, user.email)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
    // user.save().then(()=>{
    //     console.log("Result: "+user)
    //     res.status(201).send(user)
    // }).catch((error)=>{
    //     res.status(400).send(error)
    // })
})

router.post('/users/login',async (req, res)=>{
    try{
        console.log("logging in ")
        const user = await User.findByCredentials(req.body.email,req.body.password)
        console.log("ye wala user hai ",user)
        const token = await user.generateAuthToken()
        console.log("User",user)
        if(!user){
            throw new Error("Unable to login here")
        }
        res.send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
    // user.save().then(()=>{
    //     console.log("Result: "+user)
    //     res.status(201).send(user)
    // }).catch((error)=>{
    //     res.status(400).send(error)
    // })
})

router.post("/users/logout", auth, async (req,res)=>{
    try{
       console.log(req.user.tokens)
       req.user.tokens = req.user.tokens.filter((token)=>{
           return token.token !== req.token
       })
       await req.user.save()
       res.send()
   }catch(e){
       res.status(500).send()
   }
})

router.post("/users/logoutall", auth, async (req,res)=>{
    try{
       req.user.tokens = []
       await req.user.save()
       res.send()
   }catch(e){
       res.status(500).send()
   }
})

router.get("/users/me", auth, async (req,res)=>{

    try{
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)        
    }

    // try{
    //     const users = await User.find({})
    //     res.send(users)        
    // }catch(e){
    //     res.status(500).send(e)        
    // }

    // User.find({}).then((users)=>{
    //     res.send(users)
    // }).catch((error)=>{
    //     res.status(500).send(error)
    // })
})

// router.get("/users/:id",async (req,res)=>{
//     // console.log(req.params.id)

//     try{
//         const user = await User.findById(req.params.id)
//         if(!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch(e){
//         res.status(500).send(e)
//     }

//     // User.findById(req.params.id).then((user)=>{
//     //     if(!user){
//     //         return res.status(404).send()
//     //     }
//     //     res.send(user)
//     // }).catch((error)=>{
//     //     res.status(500).send(error)
//     // })
// })

router.patch("/users/me", auth, async (req,res)=>{

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','password','email','age']
    const valid = updates.every((update)=>allowedUpdates.includes(update))

    if(!valid){
        return res.status(404).send({"error":"Invalid Update"})
    }

    try{
        // const user = await User.findById(req.user._id)
        updates.forEach((update)=>req.user[update] = req.body[update])
        // console.log("updTING HERE")
        await req.user.save()
        // console.log("updTING HERE 2")

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true})
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete("/users/me",auth,async (req,res)=>{
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user){
        //     return res.status(400).send()
        // }
        console.log(req.user.name, req.user.email)
        sendCancellationMail(req.user.name, req.user.email)
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)        
    }
})

const upload = multer({
    // dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Not correct Format'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width : 250, height : 250}).png().toBuffer()
    // req.user.avatar = req.file.buffer
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({ error: error.message})
})

router.delete('/users/me/avatar', auth, async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        // console.log(user)
        if(!user || !user.avatar){
            return new Error('Profile Not Found')
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})


module.exports = router