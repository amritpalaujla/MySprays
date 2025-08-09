const express = require("express"); //importing express framework
const app = express(); // creating an instance, aka server
const cors = require("cors"); // cross origin resource sharing

const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = 3000; // the port where our server will run

app.use(cors()); // allow frontend requests
app.use(express.json()); // parses incoming json to a object

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  res.json({ message: "Login endpoint hit", email, password });
});

app.get("/", (req, res) => {
  //this path will send a plain message back once visited
  res.send("Hello from the backend!");
});

app.listen(PORT, () => {
  // starts server and once running logs the message below
  console.log(`Server running on http://localhost${PORT}`);
});
