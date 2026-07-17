const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/data', (req, res) => {
    const adminKey = req.headers['admin-key'];
    if (adminKey !== 'seeyourself@admin2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    db.query('SELECT id, name, email, created_at FROM users', (err, users) => {
        if (err) return res.status(500).json({ error: 'Failed' });

        db.query('SELECT * FROM entries ORDER BY created_at DESC', (err2, entries) => {
            if (err2) return res.status(500).json({ error: 'Failed' });

            const moodCount = {};
            entries.forEach(e => { moodCount[e.mood] = (moodCount[e.mood] || 0) + 1; });
            const topMood = Object.keys(moodCount).sort((a,b) => moodCount[b] - moodCount[a])[0] || 'None';

            res.json({ users, entries, topMood });
        });
    });
});

module.exports = router;