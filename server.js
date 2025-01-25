const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bodyParser = require("body-parser");
const axios = require("axios");

const SECRET_KEY = process.env.SECRET_KEY;

const app = express();

// Middleware setup
app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500", "https://sethtsidi.github.io"], // Add your GitHub Pages URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));

// MySQL Database connection (using pool)
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "seth",
  password: process.env.DB_PASSWORD || "school",
  database: process.env.DB_NAME || "elearning",
  waitForConnections: true,
  connectionLimit: 10,
});

// Input Validation Helpers
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function isValidPassword(password) {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordPattern.test(password);
}

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ error: "All fields are required." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).send({ error: "Invalid email format." });
  }

  try {
    const [results] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    if (results.length === 0) {
      return res.status(400).send({ error: "User not found. Please register." });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
    res.status(200).send({ token });
  } catch (error) {
    console.error("Error during login process:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});

// Register route
app.post("/register", async (req, res) => {
  const { email, password, confirmPassword, recaptchaResponse } = req.body;

  if (!email || !password || !confirmPassword) {
    return res.status(400).send({ error: "Please fill in all fields." });
  }
  if (password !== confirmPassword) {
    return res.status(400).send({ error: "Passwords do not match." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).send({ error: "Invalid email format." });
  }

  try {
    // Verify reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;
    const captchaVerification = await axios.post(verificationUrl);
    if (!captchaVerification.data.success) {
      return res.status(400).send({ error: "CAPTCHA verification failed. Please try again." });
    }

    const [existingUser] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).send({ error: "User already exists. Please log in." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.promise().query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword]);

    res.status(200).send({ message: "Account successfully created! Please log in." });
  } catch (error) {
    console.error("Error during registration process:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});

// JWT Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.userId;
    next();
  });
}

// Protected route
app.get("/protected-route", verifyToken, (req, res) => {
  res.status(200).send({ message: "Access granted to protected route" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
