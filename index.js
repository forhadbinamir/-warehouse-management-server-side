const express = require('express');
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000
require('dotenv').config()

app.use(cors())
app.use(express.json())
// user = electricwarehouse
//password = vveI0R3ljzFwZMD0


const uri = "mongodb+srv://electricwarehouse:vveI0R3ljzFwZMD0@cluster0.qdnhf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log('database connected')
client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
});

app.get('/', (req, res) => {
    res.send('warehouse api is running')
})

app.listen(port, () => {
    console.log('warehouse port is running', port)
})