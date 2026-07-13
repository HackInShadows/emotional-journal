const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        req.userId = decoded.id;
        next();
    });
};

// Add entry
router.post('/', verifyToken, (req, res) => {
    const { mood, text } = req.body;
    
    db.query(
        'INSERT INTO entries (user_id, mood, text) VALUES (?, ?, ?)',
        [req.userId, mood, text],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to save entry' });
            res.json({ message: 'Entry saved successfully' });
        }
    );
});

// Get all entries for user
router.get('/', verifyToken, (req, res) => {
    db.query(
        'SELECT * FROM entries WHERE user_id = ? ORDER BY created_at DESC',
        [req.userId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Failed to fetch entries' });
            res.json(results);
        }
    );
});

// Get mood summary
router.get('/summary', verifyToken, (req, res) => {
    db.query(
        'SELECT mood, COUNT(*) as count FROM entries WHERE user_id = ? GROUP BY mood',
        [req.userId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Failed to fetch summary' });
            res.json(results);
        }
    );
});

module.exports = router;