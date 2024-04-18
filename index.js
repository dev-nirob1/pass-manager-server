const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
app.use(cors())
app.use(express.json())
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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

async function run() {
  try {
    const passwordCollection = client.db("password_manager").collection("account");

    app.get('/account/:email', async (req, res) => {
      const email = req.params.email;
      const query = {'AddedBy.userEmail': email}
      const result = await passwordCollection.find(query).toArray()
      res.send(result)
    })

    app.put('/account', async (req, res) => {
      const account = req.body;
      const result = await passwordCollection.insertOne(account)
      // console.log(account)
      res.send(result)
    })

    app.patch('/account', async (req, res) => {
      const id = req.query.id;
      const updateAccount = req.body;
      const query = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set:{
          email: updateAccount.email,
          password: updateAccount.password
        }
      }
      const result = await passwordCollection.updateOne(query, updatedDoc)
      res.send(result)
    })

    app.delete('/account/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
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