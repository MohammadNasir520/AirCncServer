const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')

const app = express()
const port = process.env.PORT || 8000

// middlewares
app.use(cors())
app.use(express.json())

// Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c5dej4c.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    const homesCollection = client.db('aircncdb').collection('homes')
    const usersCollection = client.db('aircncdb').collection('users')
    const bookingsCollection = client.db('aircncdb').collection('bookings')


    // user save by put method
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const user = req.body;
      const filter = { email: email }
      const options = { upsert: true }
      const updateDoc = {
        $set: user
      }
      const result = await usersCollection.updateOne(filter, updateDoc, options)

      const token = jwt.sign(user, process.env.token, { expiresIn: '1h' })
      console.log(token)
      res.send({ result, token })
    })


    //save bookings
    app.post('/bookings', async (req, res) => {
      const bookingData = req.body;
      const result = await bookingsCollection.insertOne(bookingData)
      console.log(result);
      res.send(result)
    })
    // get All bookings
    app.get('/bookings', async (req, res) => {

      let query = {};
      const email = req.query.email;
      if (email) {
        query = {
          guestEmail: email,
        };
      }

      const bookings = await bookingsCollection.find(query).toArray()
      res.send(bookings)
    })

    // get a single user by email
    app.get('/user/:email', async (req, res) => {

      const email = req.params.email;
      console.log(email);
      let query = {
        email: email
      };

      const user = await usersCollection.findOne(query)
      res.send(user)
    })


    console.log('Database Connected...')
  } finally {
  }
}

run().catch(err => console.error(err))

app.get('/', (req, res) => {
  res.send('AirCnc  Server is running...')
})

app.listen(port, () => {
  console.log(`Server is running...on ${port}`)
})
