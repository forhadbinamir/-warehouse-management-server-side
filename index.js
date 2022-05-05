const express = require('express');
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
require('dotenv').config()

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qdnhf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log('data connect')
async function run() {
    try {
        await client.connect()
        const databaseCollection = client.db('electronics-warehouse').collection('suppliers')
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

        app.post('/suppliers', async (req, res) => {
            const newSupplier = req.body
            console.log('data add hoisa', newSupplier)
            const result = await databaseCollection.insertOne(newSupplier);
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