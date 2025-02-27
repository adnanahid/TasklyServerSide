const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// WebSocket server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://taskly-bbccc.web.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middleware
app.use(express.json());
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
      return res.send(result);
    }
    return res.send("already exist");
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