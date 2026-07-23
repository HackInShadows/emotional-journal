const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        req.userId = decoded.id;
        next();
    });
};

router.post('/', verifyToken, (req, res) => {
    const { mood, text } = req.body;
    db.query('INSERT INTO entries (user_id, mood, text) VALUES (?, ?, ?)',
        [req.userId, mood, text],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to save entry' });
            res.json({ message: 'Entry saved', id: result.insertId });
        }
    );
});

router.get('/', verifyToken, (req, res) => {
    db.query('SELECT id, mood, created_at FROM entries WHERE user_id = ? ORDER BY created_at DESC',
        [req.userId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Failed' });
            res.json(results);
        }
    );
});

router.get('/full', verifyToken, (req, res) => {
    db.query('SELECT * FROM entries WHERE user_id = ? ORDER BY created_at DESC',
        [req.userId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Failed' });
            res.json(results);
        }
    );
});

router.get('/summary', verifyToken, (req, res) => {
    db.query('SELECT mood, COUNT(*) as count FROM entries WHERE user_id = ? GROUP BY mood',
        [req.userId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Failed' });
            res.json(results);
        }
    );
});

router.get('/weekly', verifyToken, (req, res) => {
    db.query(`SELECT mood, COUNT(*) as count FROM entries WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY mood ORDER BY count DESC`,
        [req.userId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Failed' });
            res.json(results);
        }
    );
});

router.get('/count', verifyToken, (req, res) => {
    db.query('SELECT COUNT(*) as total FROM entries WHERE user_id = ?',
        [req.userId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Failed' });
            res.json({ total: results[0].total });
        }
    );
});

router.post('/feedback', verifyToken, (req, res) => {
    const { entry_id, rating, written_feedback, mood } = req.body;
    db.query('INSERT INTO feedback (user_id, entry_id, rating, written_feedback, mood) VALUES (?, ?, ?, ?, ?)',
        [req.userId, entry_id || null, rating, written_feedback || null, mood || null],
        (err) => {
            if (err) return res.status(500).json({ error: 'Failed' });
            res.json({ message: 'Feedback saved' });
        }
    );
});

router.post('/growth', verifyToken, (req, res) => {
    const { mood, response } = req.body;
    db.query('INSERT INTO growth_responses (user_id, mood, response) VALUES (?, ?, ?)',
        [req.userId, mood, response],
        (err) => {
            if (err) return res.status(500).json({ error: 'Failed' });
            res.json({ message: 'Growth response saved' });
        }
    );
});

router.get('/growth', verifyToken, (req, res) => {
    db.query('SELECT * FROM growth_responses WHERE user_id = ? ORDER BY created_at DESC',
        [req.userId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Failed' });
            res.json(results);
        }
    );
});

module.exports = router;