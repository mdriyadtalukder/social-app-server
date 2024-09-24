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
        const requestsCollection = client.db("socialApp").collection("requests");


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

        //update post num
        app.patch('/postnumber/:id', async (req, res) => {
            const data = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    post: data.post

                }
            }
            const result = await usersCollection.updateOne(query, updatedDoc)
            res.send(result)
        });

        //update followers num
        app.patch('/following/:id', async (req, res) => {
            const data = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    following: data.following

                }
            }
            const result = await usersCollection.updateOne(query, updatedDoc)
            res.send(result)
        });

        //update followers num
        app.patch('/followers/:id', async (req, res) => {
            const data = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    followers: data.followers

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


        // search request by email query
        app.get('/requests', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await requestsCollection.find(query).toArray();
            res.send(result);
        })
        //posts add
        app.post('/requests', async (req, res) => {
            const item = req.body;
            const result = await requestsCollection.insertOne(item);
            res.send(result);
        })


        app.delete('/request/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await requestsCollection.deleteOne(query);
            res.send(result);
        })
        app.get('/followingsposts', async (req, res) => {
            try {
                const email = req.query.email;

                // Query to find the user by email
                const userQuery = { email: email };
                const user = await usersCollection.findOne(userQuery);

                if (!user || !user.following || !Array.isArray(user.following)) {
                    return res.status(404).send({ message: "User not found or no followers" });
                }

                // Get the list of follower emails
                const followerEmails = user.following;

                // Query the postsCollection to find posts by follower emails
                const postsQuery = { email: { $in: [email, ...followerEmails] } };
                const posts = await postsCollection.find(postsQuery).toArray();
                //console.log(posts)
                res.send(posts);
            } catch (error) {
                res.status(500).send({ message: "Error retrieving followers' posts", error });
            }
        });




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