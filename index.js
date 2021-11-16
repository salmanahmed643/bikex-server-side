const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 7000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xbwqg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("bike_x2");
    const bikex2Collection = database.collection("bike_products");
    const reviewsCollection = database.collection('reviews');
    const ordersCollection = database.collection('orders');
    const usersCollection = database.collection('users')


    // get product api
    app.get("/products", async (req, res) => {
      const cursor = bikex2Collection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    // get product single api
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const products = await bikex2Collection.findOne(query);
      res.json(products);
    });




    // product Post api
    app.post('/products', async(req, res) => {
        const product = req.body;
        console.log('hit the post', product)

        const result = await bikex2Collection.insertOne(product);
        console.log(result)
        res.json(result)
    })




    // reviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // reviews GET api
    app.get('/reviews', async(req, res) => {
        const cursor = reviewsCollection.find({});
        const reviews = await cursor.toArray();
        res.send(reviews)
    })

    // reviews add post api
    app.post('/reviews', async(req, res) => {
        const review  = req.body;
        console.log("hit the post api", review)
        const result = await reviewsCollection.insertOne(review);
        console.log(result)
        res.json(result)
    })


    // order complete
    app.get("/ordercomplete", async(req, res) => {
        const email = req.query.email;
        const query = {email: email}
        const cursor = ordersCollection.find(query);
        const myorders = await cursor.toArray();
        res.json(myorders);
    })

    app.post("/ordercomplete", async(req, res) => {
        const orders = req.body;
        const result = await ordersCollection.insertOne(orders)
        console.log(result);
        res.json(result)
    })

    app.post('/users', async(req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
    });


    app.get('/users/:email', async(req, res) => {
        const email = req.params.email;
        const query = {email: email};
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({admin: isAdmin});
    })


    app.put('/users', async(req, res) => {
        const user = req.body;
        const filter = {email: user.email};
        const options = {upsert: true};
        const updateDoc = {$set: user};
        const result = await usersCollection.updateOne(filter, updateDoc, options)
        res.json(result)
    });

    app.put('/users/admin', async(req, res) => {
        const user = req.body;
        console.log("put", user)
        const filter = {email: user.email}
        const updateDoc = {$set: {role: 'admin'}};
        const result = await usersCollection.updateOne(filter, updateDoc)
        res.json(result);
    })


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Bikex server");
});
app.listen(port, () => {
  console.log("Running port on", port);
});
