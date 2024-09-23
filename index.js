const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.avhjzxg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const usersCollection = client.db("socialApp").collection("users");
        const postsCollection = client.db("socialApp").collection("posts");


        // Get users
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });
        app.get('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })
        // search user by email query
        app.get('/user', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await usersCollection.findOne(query);
            res.send(result);
        })

        //Add user by searching is it or not
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exist!', insertedId: null })
            }

            const result = await usersCollection.insertOne(user);
            res.send(result);

        })

        app.patch('/user/:id', async (req, res) => {
            const data = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    des: data.des,
                    live: data.live,
                    school: data.school,
                    work: data.work,
                    link: data.link,

                }
            }
            const result = await usersCollection.updateOne(query, updatedDoc)
            res.send(result)
        })


        // Get posts
        app.get('/posts', async (req, res) => {
            const result = await postsCollection.find().toArray();
            res.send(result);
        });
        // search posts by email query
        app.get('/post', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await postsCollection.find(query).toArray();
            res.send(result);
        })
        //posts add
        app.post('/posts', async (req, res) => {
            const item = req.body;
            const result = await postsCollection.insertOne(item);
            res.send(result);
        })






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Social app is sitting!!');
});

app.listen(port, () => {
    console.log(`social app sitting on ${port} port`)
})