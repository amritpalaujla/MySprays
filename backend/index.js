const express = require("express"); //importing express framework
const app = express(); // creating an instance, aka server
const cors = require("cors"); // cross origin resource sharing
const User = require("./models/User");
const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = 3000; // the port where our server will run

app.use(cors()); // allow frontend requests
app.use(express.json()); // parses incoming json to a object

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({ email, passwordHash });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  //res.json({ message: "Login endpoint hit", email, password });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    //checking password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.json({ message: "Login successful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/", (req, res) => {
  //this path will send a plain message back once visited
  res.send("Hello from the backend!");
});

app.listen(PORT, () => {
  // starts server and once running logs the message below
  console.log(`Server running on http://localhost${PORT}`);
});
