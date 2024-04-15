const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
app.use(cors())
app.use(express.json())
const { MongoClient, ServerApiVersion } = require('mongodb');

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