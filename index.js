const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
const port = process.env.PORT || 5000


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@simplecrud.xgcpsfy.mongodb.net/?retryWrites=true&w=majority&appName=simpleCrud`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middleware
const verifyJwt = async (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err)
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.user = decoded
    next()
  })
}

async function run() {
  try {
    const passwordCollection = client.db("password_manager").collection("account");

    //add cookies after login
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      // console.log(user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
      // console.log(token)
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
        .send({ success: true })
    })

    // remove cookies after logout
    app.post('/logout', async (req, res) => {
      const user = req.body;
      // console.log('logging out ', user);
      res.clearCookie('token', { maxAge: 0 })
        .send({ success: true })
    })

    //get user specific data
    app.get('/account/user/:email', verifyJwt, async (req, res) => {
      const email = req.params.email;
      // console.log('token owner', req.user)
      if (email !== req?.user?.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { 'AddedBy.userEmail': email }
      const result = await passwordCollection.find(query).toArray()
      res.send(result)
    })

    //get single data
    app.get('/singleAcount/:id', verifyJwt, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      console.log(id, query)

      const result = await passwordCollection.findOne(query)
      res.send(result)
    })

    //add account
    app.put('/account', verifyJwt, async (req, res) => {
      const account = req.body;
      const result = await passwordCollection.insertOne(account)
      // console.log(account)
      res.send(result)
    })

    //update username/email
    app.patch('/account/update', verifyJwt, async (req, res) => {
      const id = req.query.id;
      const updateAccount = req.body;
      const query = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          email: updateAccount.email,
          password: updateAccount.password
        }
      }
      const result = await passwordCollection.updateOne(query, updatedDoc)
      res.send(result)
    })

    //delete account
    app.delete('/account/delete/:id', verifyJwt, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await passwordCollection.deleteOne(query)
      res.send(result)
    })



    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('hello world')
})

app.listen(port, () => {
  console.log(`app is running on port ${port}`)
})