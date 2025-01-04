const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

const app = express();
const client = new textToSpeech.TextToSpeechClient();

// Middleware setup
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'], // Allow both localhost and 127.0.0.1
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files from the 'public' folder

// MySQL Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'seth', // MySQL username
    password: 'school', // MySQL password
    database: 'elearning' // MySQL database
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }
    console.log("Connected to MySQL database.");
});

// JWT Secret Key
const SECRET_KEY = "your_secret_key";

// --- USER AUTHENTICATION ROUTES ---
// Register Route
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(checkUserQuery, [email], async (err, results) => {
            if (err) {
                console.error("Error checking for existing user:", err);
                return res.status(500).send({ error: "Error checking for existing user" });
            }
            if (results.length > 0) {
                return res.status(400).send({ error: "User already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertUserQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
            db.query(insertUserQuery, [email, hashedPassword], (err) => {
                if (err) {
                    console.error('Error inserting user into MySQL:', err);
                    return res.status(500).send({ error: 'Error registering user' });
                }
                res.status(201).send({ message: 'User registered successfully' });
            });
        });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send({ error: 'Error registering user' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Error querying MySQL:', err);
            return res.status(500).send({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(400).send({ error: 'User not found' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).send({ token });
    });
});

// Token Validation Route
app.post('/validate-token', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).send({ valid: false });

    jwt.verify(token, SECRET_KEY, (err) => {
        if (err) return res.status(403).send({ valid: false });
        res.send({ valid: true });
    });
});



