const express = require("express"); //importing express framework
const app = express(); // creating an instance, aka server
const cors = require("cors"); // cross origin resource sharing
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sprays = require("./models/Sprays");
const cookieParser = require("cookie-parser");

const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 3000; // the port where our server will run

app.use(
  cors({
    origin: "https://mysprays.netlify.app/",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
); // cors lets us choose where loading resources are allowed to come from
app.use(express.json()); // parses incoming json to a object in req body
app.use(cookieParser());

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_RERESH_SECRET,
    { expiresIn: "7d" }
  );
}

function verifyToken(req, res, next) {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: "No valid token provided" });
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

app.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "no refresh token provided" });
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (err, decodedUser) => {
      if (err) {
        console.log("Refresh token error: ", err.message);
        //clear invalid refresh token
        res.clearCookie("refreshToken");
        return res
          .status(401)
          .json({ error: "Invalid or expired refresh token" });
      }

      try {
        const user = await User.findById(decodedUser.id);
        if (!user) {
          res.clearCookie("refreshToken");
          return res.status(401).json({ error: "User not found" });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        //new cookie
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV == "production",
          sameSite: "lax",
          maxAge: 15 * 60 * 1000, // 15 min
        });

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV == "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 1000, // 7 days
        });

        res.json({
          message: "Tokens refreshed successfully",
          user: {
            id: user._id,
            email: user.email,
          },
        });
      } catch (error) {
        console.error("Error refreshing token: ", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );
});

app.post("/sprays", verifyToken, async (req, res) => {
  try {
    const { sprayName, date, crop, rate, amount, location, PHI, PCP } =
      req.body;
    const newSpray = new Sprays({
      userId: req.user.id,
      sprayName,
      date,
      crop,
      rate,
      amount,
      location,
      PHI,
      PCP,
    });

    const savedSpray = await newSpray.save();
    res.json(savedSpray);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

    //generating tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    //setting cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
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

app.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
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

//deleting a spray log
app.delete("/sprays/:id", verifyToken, async (req, res) => {
  try {
    const sprayId = req.params.id;
    const deletedSpray = await Sprays.findOneAndDelete({
      _id: sprayId,
      userId: req.user.id,
    });
    if (!deletedSpray) {
      return res
        .status(404)
        .json({ error: "Spray not found or user not authorized" });
    }
    res.json({ message: "Spray deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//updating a spray log
app.put("/sprays/:id", verifyToken, async (req, res) => {
  try {
    const sprayId = req.params.id;
    const { sprayName, date, crop, rate, amount, location, PHI, PCP } =
      req.body;

    const updatedSpray = await Sprays.findOneAndUpdate(
      {
        _id: sprayId,
        userId: req.user.id,
      },
      {
        sprayName,
        date,
        crop,
        rate,
        amount,
        location,
        PHI,
        PCP,
      },
      { new: true } // Returns the updated document
    );
    if (!updatedSpray) {
      return res
        .status(404)
        .json({ error: "Spray not found or user not authorized" });
    }
    res.json(updatedSpray);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/sprays", verifyToken, async (req, res) => {
  try {
    const { sort, location, startDate, endDate } = req.query;

    let query = { userId: req.user.id }; // Start with the user ID filter

    // Filtering by location
    if (location) {
      query.location = location;
    }

    // Filtering by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    let spraysQuery = Sprays.find(query);

    // Sorting
    if (sort === "dateAsc") {
      spraysQuery = spraysQuery.sort({ date: 1 });
    } else if (sort === "dateDesc") {
      spraysQuery = spraysQuery.sort({ date: -1 });
    } else {
      spraysQuery = spraysQuery.sort({ date: -1 }); // Default sort by newest first
    }

    const sprays = await spraysQuery.exec();

    res.json(sprays);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
