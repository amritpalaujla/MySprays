const express = require("express"); //importing express framework
const app = express(); // creating an instance, aka server
const cors = require("cors"); // cross origin resource sharing
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = 3000; // the port where our server will run

app.use(
  cors({
    origin: "http://localhost:5173",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); // cors lets us choose where loading resources are allowed to come from
app.use(express.json()); // parses incoming json to a object in req body

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No valid token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // here we verify and decode the jwt
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      console.log("Token verification error:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.user = decodedUser;
    next();
  });
}

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

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
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    //checking password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //generating a token after successful login
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    //sending back token
    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// here we check if token is still valid and not expired
app.get("/verify-token", verifyToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      email: req.user.email,
    },
  });
});

app.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: `Welcome to your dashboard`,
    user: req.user,
  });
});

app.get("/", (req, res) => {
  //this path will send a plain message back once visited
  res.send("Hello from the backend!");
});

//error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  // starts server and once running logs the message below
  console.log(`Server running on http://localhost${PORT}`);
});
