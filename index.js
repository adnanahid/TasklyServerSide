const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware to parse JSON data
app.use(express.json());

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://taskly-bbccc.web.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.kgmqz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  await client.connect();
  console.log("Connected to MongoDB!");

  const TaskLy_DB = client.db("TaskLy_DB");
  const usersCollection = TaskLy_DB.collection("usersCollections");
  const taskCollection = TaskLy_DB.collection("taskCollection");

  // ** User Registration **
  app.post("/userDetails", async (req, res) => {
    const details = req.body;
    const isExist = await usersCollection.findOne({ email: details.email });

    if (!isExist) {
      const result = await usersCollection.insertOne(details);
      return res.status(200).send(result);
    }
    return res.status(409).send({ message: "User already exists" });
  });

  // ** Add New Task **
  app.post("/tasks", async (req, res) => {
    const task = req.body;
    const result = await taskCollection.insertOne(task);
    res.send(result);
  });

  // ** Get Tasks by Email **
  app.get("/tasks/:email", async (req, res) => {
    const query = { email: req.params.email };
    const result = await taskCollection.find(query).toArray();
    res.send(result);
  });

  // ** Delete Task **
  app.delete("/tasks/:_id", async (req, res) => {
    const result = await taskCollection.deleteOne({
      _id: new ObjectId(req.params._id),
    });
    res.send("Task deleted successfully");
  });

  // ** Update Task **
  app.put("/tasks/:id", async (req, res) => {
    const result = await taskCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.send(result);
  });
}

run().catch(console.dir);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
