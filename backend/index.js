const express = require("express"); //importing express framework
const app = express(); // creating an instance, aka server
const cors = require("cors"); // cross origin resource sharing
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sprays = require("./models/Sprays");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const { sendVerificationEmail } = require("./services/emailService");
const { sendPasswordResetEmail } = require("./services/emailService");

const mongoose = require("mongoose");
require("dotenv").config();

// variables test to see if loading

console.log("=== Environment Variables Check ===");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "SET" : "NOT SET");
console.log("===================================");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 3000; // the port where our server will run

app.use(
  cors({
    origin: ["https://mysprays.netlify.app"],
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
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

function verifyToken(req, res, next) {
  console.log("=== Token Verification Debug ===");
  console.log("All cookies:", req.cookies);
  console.log("Access token exists:", !!req.cookies.accessToken);
  console.log("User agent:", req.get("User-Agent"));
  console.log("Origin:", req.get("Origin"));
  const token = req.cookies.accessToken;

  if (!token) {
    console.log("No access token found in cookies");
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

app.post("/refresh-token", async (req, res) => {
  try {
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

          res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
          });

          res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 1000,
          });

          res.json({
            message: "Tokens refreshed successfully",
            user: {
              id: user._id,
              email: user.email,
              region: user.region || "CA",
            },
          });

          // REMOVED THE PROBLEMATIC CONSOLE.LOGS HERE
        } catch (error) {
          console.error("Error refreshing token: ", error);
          res.status(500).json({ error: "Internal server error" });
        }
      }
    );
  } catch (error) {
    console.error("Refresh token route error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Clear all sprays for a user
app.delete("/sprays/clear-all", verifyToken, async (req, res) => {
  try {
    const result = await Sprays.deleteMany({ userId: req.user.id });
    console.log(
      `✅ Deleted ${result.deletedCount} spray logs for user ${req.user.id}`
    );
    res.json({
      message: `Successfully deleted ${result.deletedCount} spray log(s)`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Error clearing sprays:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete user account
app.delete("/user/delete-account", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all user's sprays first
    await Sprays.deleteMany({ userId });

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    console.log(`✅ Deleted account for user: ${deletedUser.email}`);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/sprays", verifyToken, async (req, res) => {
  try {
    const { sprayName, date, crop, rate, amount, unit, location, PHI, PCP } =
      req.body;
    const newSpray = new Sprays({
      userId: req.user.id,
      sprayName,
      date,
      crop,
      rate,
      amount,
      unit, // Add this
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

    // generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = new User({
      email,
      passwordHash,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    });
    await newUser.save();

    //send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
      res.json({
        message:
          "Registration successfull! Please check your email to verify your account.",
        emailSent: true,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      res.json({
        message:
          "Registration successful, but verification email failed. Please contact support.",
        emailSent: false,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Return region in login response
// UPDATE YOUR EXISTING /login route to include region:
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Please Verify your email before logging in. Check your inbox for the verification link.",
        requiresVerification: true,
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        region: user.region || "CA", // ← ADD THIS
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

//verify email endpoint
app.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  console.log("=== Verification Request ===");
  console.log("Token received:", token);

  if (!token) {
    return res.status(400).json({ message: "Verification token is required" });
  }

  try {
    // First, try to find user with this token
    let user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    // If not found with valid token, check if already verified
    if (!user) {
      // Check if this token was used (user exists but token is cleared)
      user = await User.findOne({
        verificationToken: undefined,
        isVerified: true,
      });

      // If we find a verified user, they might have already verified
      if (user) {
        console.log("⚠️ User already verified");
        return res.json({
          message: "Email already verified! You can log in.",
          success: true,
          alreadyVerified: true,
        });
      }

      console.log("❌ Invalid or expired token");
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    // User found with valid token - verify them
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    console.log("✅ User verified successfully:", user.email);

    res.json({
      message: "Email verified successfully! You can now log in.",
      success: true,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
});

//resend verification email endpoint
app.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    //Generate new token

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;

    await user.save();

    await sendVerificationEmail(email, verificationToken);

    res.json({
      message: "Verification email resent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Resend verification error", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  console.log("=== Forgot Password Request ===");
  console.log("Email:", email);

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found");
      return res.json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
        success: true,
      });
    }

    console.log("✅ User found:", user.email);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    console.log("Generated reset token:", resetToken);
    console.log("Token expires:", resetTokenExpires);

    // Save to user object
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;

    // Save to database
    const savedUser = await user.save();

    console.log("✅ Token saved to database");
    console.log("Saved token:", savedUser.resetPasswordToken);
    console.log("Saved expiry:", savedUser.resetPasswordExpires);

    // Verify it was actually saved by querying again
    const verifyUser = await User.findOne({ email });
    console.log("Verification - Token in DB:", verifyUser.resetPasswordToken);

    // Send email
    const { sendPasswordResetEmail } = require("./services/emailService");
    await sendPasswordResetEmail(email, resetToken);

    console.log("✅ Password reset email sent");

    res.json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
      success: true,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//reset password with token
app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  console.log("=== Reset Password Request ===");
  console.log("Token received:", token);
  console.log("New password received:", newPassword ? "YES" : "NO");
  console.log("Password length:", newPassword?.length);

  if (!token || !newPassword) {
    console.log("❌ Missing token or password");
    return res
      .status(400)
      .json({ message: "Token and new password are required" });
  }

  if (newPassword.length < 6) {
    console.log("❌ Password too short");
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    console.log("User found with token:", user ? "YES" : "NO");

    if (!user) {
      // Check if token exists but is expired
      const expiredUser = await User.findOne({ resetPasswordToken: token });

      if (expiredUser) {
        console.log("❌ Token exists but is EXPIRED");
        console.log("Token expired at:", expiredUser.resetPasswordExpires);
        console.log("Current time:", new Date());
        return res.status(400).json({
          message:
            "Reset token has expired. Please request a new password reset.",
        });
      }

      console.log("❌ Token not found in database at all");
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log("✅ Password reset successful for:", user.email);

    res.json({
      message:
        "Password reset successful! You can now log in with your new password.",
      success: true,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
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

//temporary for debugging
/*
app.get("/debug-user/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.json({ exists: false });
    }
    res.json({
      exists: true,
      email: user.email,
      hasResetToken: !!user.resetPasswordToken,
      resetToken: user.resetPasswordToken,
      tokenExpires: user.resetPasswordExpires,
      isExpired: user.resetPasswordExpires < Date.now(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});*/

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

//get sprays
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

//updating a spray log
app.put("/sprays/:id", verifyToken, async (req, res) => {
  try {
    const sprayId = req.params.id;
    const { sprayName, date, crop, rate, amount, unit, location, PHI, PCP } =
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
        unit, // Add this
        location,
        PHI,
        PCP,
      },
      { new: true }
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

app.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: `Welcome to your dashboard`,
    user: req.user,
  });
});

app.get("/test-email-direct", async (req, res) => {
  const nodemailer = require("nodemailer");

  console.log("Creating transporter with:");
  console.log("User:", process.env.EMAIL_USER);
  console.log("Pass length:", process.env.EMAIL_PASSWORD?.length);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    // Test connection
    await transporter.verify();
    console.log("✅ SMTP connection successful!");

    // Try sending
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: "Test Email",
      text: "If you see this, email is working!",
    });

    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("❌ Email test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }
});
// Get user region preference (works for logged-in users)
app.get("/user/region", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ region: user.region || "CA" });
  } catch (error) {
    console.error("Error fetching user region:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user region preference
app.put("/user/region", verifyToken, async (req, res) => {
  try {
    const { region } = req.body;

    if (!region || !["CA", "US"].includes(region)) {
      return res
        .status(400)
        .json({ error: "Invalid region. Must be 'CA' or 'US'" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { region },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Region updated successfully",
      region: user.region,
    });
  } catch (error) {
    console.error("Error updating user region:", error);
    res.status(500).json({ error: "Server error" });
  }
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
