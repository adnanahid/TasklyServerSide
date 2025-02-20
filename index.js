require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.kgmqz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const TaskLy_DB = client.db("TaskLy_DB");
    const usersCollection = TaskLy_DB.collection("usersCollections");

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.post("/userDetails", async (req, res) => {
      const details = req.body;
      const isExist = await usersCollection.findOne({ email: details.email });
      if (!isExist) {
        const result = await usersCollection.insertOne(details);
        return res.send(result);
      } else {
        return res.send("already exist");
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}`);
});
