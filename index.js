const express = require('express')
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient
const ServerApiVersion = require('mongodb').ServerApiVersion
const dotenv = require("dotenv")
const JWT = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const body_parser = require('body-parser')
const cookie_parser = require('cookie-parser')
const EmailTransporter = require('./EmailTransporter')
const Cloudinary = require('./CloudinarySetup')
const crypto = require('crypto')
const session = require('express-session')
const multer = require('multer')
const { ObjectId } = require('mongodb')

const app = express()
app.use(cors())
app.use(body_parser.json())
app.use(cookie_parser())
app.use(express.static('./public'))
app.use(
    session({
        resave: false,
        saveUninitialized: false,
        secret: 'ses',
        cookie: {
            maxAge: 1000 * 60 * 60,
            sameSite: 'none',
            secure: true
        }
    })
)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    }
})
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
 })
dotenv.config()

//Nodemailer communication


//database communication
//const MongoClient = mongodb.MongoClient
let aliasUri = process.env.ALIAS_MONGODB_URL
let password = 'NoHablo30082022'
let db, user_connection
let conn, client

conn = new MongoClient(`mongodb+srv://patnajda:NoHablo30082022@noteapp.b2kbn3g.mongodb.net/?retryWrites=true&w=majority`)
try {
    conn.connect()
    db = conn.db("NoteApp")
    user_connection = db.collection("Users")
    post_collection = db.collection("Posts")
    
} catch(err) {
    console.error(err)
}

app.get('/', async (req, res) => {
    await res.sendFile('/index.html')
})

app.get('/getUsers', async (req, res) => {
    user_connection.find({}).toArray().then((data) => {
        res.status(200).json(data)
    }).catch(err => {
        console.log(err)
        res.status(500).json({'result': 'error occured!'})
    })
})

app.get('/getUser/:email', async (req, res) => {
    user_connection.find({'email': req.params.email}).toArray().then((data) => {
        res.status(200).json(data)
    }).catch(err => {
        console.log(err)
        res.status(500).json({'result': 'error occured!'})
    })
})

app.get('/getUser/:id', async (req, res) => {
    user_connection.find({'_id': req.params.id}).toArray().then((data) => {
        res.status(200).json(data)
    }).catch(err => {
        console.log(err)
        res.status(500).json({'result': 'error occured!'})
    })
})

app.post('/registerUser', async (req, res) => {
    const {username, email, password} = req.body
    const transporter = new EmailTransporter(email, "ActivateLink", 'http://localhost:3000/login')
    try {
        user_connection.insertOne({
            "username": username,
            "email": email,
            "password": password
        })
        console.log({
            "username": username,
            "email": email,
            "password": password
        })
        transporter.sendRegisterEmail()
        res.status(201).json({'result': 'suceess'})
    } catch(err) {
        console.error(err)
        res.status(500).json({'result': 'error occured'})    
    }
    //await add a record to the database and do proper exception
})

//app.delete('/deleteUser/:id', )

app.post('/login', async (req, res) => {
    const {email, password} = req.body
    let result
    user_connection.find({'email': email, 'password': password}).toArray().then(data => {
        console.log(data)
        let token = crypto.randomBytes(64).toString('hex')
        result = JWT.sign({userdata: data[0]._id}, token, {expiresIn: '300s'})
        res.cookie("jwt", result)
        res.status(200).json({result, "id": data[0]._id})
    }).catch(err => {
        console.error(err)
        res.status(500).json(err)
    })
    
    //return JWT.sign()
})

app.post('/login', async (req, res) => {

})

app.get('/getNotes', async (req, res) => {
    await post_collection.find({}).toArray().then((data) => {
        res.status(200).json(data)
    }).catch(err => {
        res.status(500).json(err)
    })
})

app.get('/getNotes/:id', async (req, res) => {
    try {
        const data = await post_collection.find({"user_id": req.params.id}).toArray()
        res.status(200).json(data)
    } catch(err) {

    }
})

app.post('/addNote', async (req, res) => {
    const {user_id, title, content, creating_date, multimedia} = req.body
    try {
        post_collection.insertOne({
            "user_id": user_id,
            "title": title,
            "content": content,
            "creating_date": new Date(creating_date).toLocaleDateString('en-CA'),
            "multimedia": multimedia
        })
        console.log({user_id, title, content, creating_date, multimedia})
        res.status(201).json({result: "success"})
    } catch(err) {
        console.error(err)
        res.status(500).json({result: "error occured"})
    }
})

app.delete('/deleteNote/:id', async (req, res) => {
    const id = req.params.id
    post_collection.findOneAndDelete({"_id": new ObjectId(id.toString())}).then((data) => {
        res.status(200).json(data)
    }).catch(err => {
        console.log(err)
        res.status(500).json({'result': 'error occured!'})
    })
})

app.post('/addImage', upload.single('thefile'), async (req, res) => {
    const image = req.file
    const url = `${req.protocol}://${req.get('host')}`
    try {
        console.log(req.body)
        console.log(url)
        //upload.array(req.body, 1)
        console.log('upload single image')
        let cloud = new Cloudinary(image, req.body.owner.toString())
        cloud.control_function()
        cloud.upload()
        res.status(200).json({"result": image})
    } catch(err) {
        console.log(err)
        res.status(500).json(err)
    }
})

app.get('/getImage/:id', async (req, res) => {
    let id = req.params.id
    let cloud = new Cloudinary(req.body, id.toString())
    cloud.getImages().then(response => {
        console.log(response)
        res.status(200).json(response)
    }).catch(err => {
        console.error(err)
        res.status(500).json(err)
    })
    
})

app.listen(2001, () => {
    console.log('noteapp server works!!')
})