const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(
  cors({
    origin: ["https://taskly-bbccc.web.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
    const taskCollection = TaskLy_DB.collection("taskCollection");

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

    app.post("/tasks", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      return res.send(result);
    });

    app.get("/tasks/:email", async (req, res) => {
      const query = { email: req.params.email };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/tasks/:_id", async (req, res) => {
      const result = await taskCollection.deleteOne({
        _id: new ObjectId(req.params._id),
      });
      res.send("Task deleted successfully");
    });

    app.put("/tasks/:id", async (req, res) => {
      const result = await taskCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
      );
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}`);
});
