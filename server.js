require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const bodyParser = require("body-parser");
const OpenAI = require("openai");

const SECRET_KEY = process.env.SECRET_KEY;
const PORT = process.env.PORT || 5000;

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure .env contains this key
});

const app = express();

// Middleware setup
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "https://sethtsidi.github.io",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(bodyParser.json());

// MySQL Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Middleware to verify JWT token for protected routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token not found. Please log in." });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token is invalid or expired." });
    }
    req.user = user; // Attach the decoded user information to the request
    next(); // Continue to the next middleware or route handler
  });
}

// Register route with reCAPTCHA integration
app.post("/register", async (req, res) => {
  const { email, password, confirmPassword, recaptchaResponse } = req.body;

  if (!email || !password || !confirmPassword || !recaptchaResponse) {
    return res.status(400).send({ error: "Please fill in all fields." });
  }
  if (password !== confirmPassword) {
    return res.status(400).send({ error: "Passwords do not match." });
  }

  try {
    // Verify reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;
    const captchaVerification = await axios.post(verificationUrl);

    if (!captchaVerification.data.success) {
      return res
        .status(400)
        .send({ error: "CAPTCHA verification failed. Please try again." });
    }

    // Check if user already exists
    const [existingUser] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      return res
        .status(400)
        .send({ error: "User already exists. Please log in." });
    }

    // Hash the password and register the user
    const hashedPassword = await bcrypt.hash(password, 10);
    await db
      .promise()
      .query("INSERT INTO users (email, password) VALUES (?, ?)", [
        email,
        hashedPassword,
      ]);

    res.status(200).send({ message: "Account successfully created!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ error: "Please fill in all fields." });
  }

  try {
    const [users] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).send({ error: "Invalid email or password." });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    console.log('Generated JWT Token:', token); // Log the JWT for debugging
    res.status(200).send({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});

// Chatbot Route (Protected by JWT with OpenAI Integration)
app.post("/chat", authenticateToken, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
      max_tokens: 150,
    });

    if (!response || !response.choices || response.choices.length === 0) {
      return res.status(500).json({ error: "⚠️ OpenAI returned an empty response." });
    }

    const botResponse = response.choices[0].message.content.trim();
    res.json({ response: botResponse });
  } catch (error) {
    console.error("❌ Error during OpenAI API call:", error);
    res.status(500).json({ error: "❌ OpenAI API error. Check server logs." });
  }
});

// Protected route example (requires valid token)
app.get("/protected-route", authenticateToken, (req, res) => {
  res.json({ message: `Welcome! You are logged in as ${req.user.email}.` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
