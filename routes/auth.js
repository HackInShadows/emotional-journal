const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Register
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        (err, result) => {
            if (err) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            res.json({ message: 'User registered successfully' });
        }
    );
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    db.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, results) => {
            if (err || results.length === 0) {
                return res.status(400).json({ error: 'User not found' });
            }
            
            const user = results[0];
            const validPassword = bcrypt.compareSync(password, user.password);
            
            if (!validPassword) {
                return res.status(400).json({ error: 'Invalid password' });
            }
            
            const token = jwt.sign(
                { id: user.id, name: user.name },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({ token, name: user.name });
        }
    );
});

module.exports = router;