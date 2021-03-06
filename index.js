const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
require('dotenv').config()

app.use(cors())
app.use(express.json())

//jwt access token 
function jwtVerify(req, res, next) {
    const authHeaders = req.headers.authorization
    if (!authHeaders) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeaders.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        console.log('decoded', decoded)
        req.decoded = decoded
        next()
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qdnhf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log('data connect')
async function run() {
    try {
        await client.connect()
        const databaseCollection = client.db('electronics-warehouse').collection('suppliers')
        const usersCollection = client.db('electronics-warehouse').collection('person')

        // implement jwt token 
        app.post('/login', async (req, res) => {
            const user = req.body
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken })
        })
        // show single email user data by using this api
        app.get('/person', jwtVerify, async (req, res) => {
            const decodedEmail = req.decoded.email
            const email = req.query.email
            if (email === decodedEmail) {
                const query = { email: email }
                const cursor = usersCollection.find(query)
                const result = await cursor.toArray()
                res.send(result)
            }

        })
        // person collection api
        app.post('/person', async (req, res) => {
            const person = req.body
            const result = await usersCollection.insertOne(person)
            res.send(result)
        })
        // find a single supplier from the server using this api
        app.get('/suppliers/:supplierId', async (req, res) => {
            const id = req.params.supplierId;
            const query = { _id: ObjectId(id) }
            const result = await databaseCollection.findOne(query)
            res.send(result)
        })
        // show all supplier in the ui by using thi api
        app.get('/suppliers', async (req, res) => {
            const query = {}
            const cursor = databaseCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        //show single supplier for updating 
        app.get('/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await databaseCollection.findOne(query)
            res.send(result)
        })

        // get data client site to database using this api
        app.post('/suppliers', async (req, res) => {
            const newSupplier = req.body
            console.log('data add hoisa', newSupplier)
            const result = await databaseCollection.insertOne(newSupplier);
            res.send(result)
        })
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id
            const updateQuantity = req.body;
            console.log(updateQuantity)
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    quantity: updateQuantity.quantity
                }
            }
            const result = await databaseCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })
        // update supplier 
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const updateSupplier = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    name: updateSupplier.name,
                    supplier: updateSupplier.supplierName,
                    quantity: updateSupplier.quantity,
                    price: updateSupplier.price,
                    image: updateSupplier.image,
                    description: updateSupplier.description
                }
            }
            const result = await databaseCollection.updateOne(filter, updateDoc, options)
            res.send(result)

        })
        // delet supplier 
        app.delete('/suppliers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await databaseCollection.deleteOne(query)
            res.send(result)
        })
    }
    finally { }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('warehouse api is running')
})

app.listen(port, () => {
    console.log('warehouse port is running', port)
})