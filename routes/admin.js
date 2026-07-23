const express = require('express');
const router = express.Router();
const db = require('../db');

const ADMIN_KEY = 'seeyourself@admin2026';

function verifyAdmin(req, res, next) {
    if (req.headers['admin-key'] !== ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

router.get('/data', verifyAdmin, (req, res) => {
    db.query('SELECT id, name, email, created_at FROM users', (err, users) => {
        if (err) return res.status(500).json({ error: 'Failed' });
        // Admin sees mood and date ONLY — no journal text
        db.query('SELECT id, user_id, mood, created_at FROM entries ORDER BY created_at DESC', (err2, entries) => {
            if (err2) return res.status(500).json({ error: 'Failed' });
            db.query(`SELECT f.id, f.user_id, f.mood, f.rating, f.written_feedback, f.created_at, u.name as user_name FROM feedback f JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC`, (err3, feedback) => {
                if (err3) return res.status(500).json({ error: 'Failed' });
                db.query(`SELECT g.id, g.user_id, g.mood, g.created_at, u.name as user_name FROM growth_responses g JOIN users u ON g.user_id = u.id ORDER BY g.created_at DESC`, (err4, growth) => {
                    if (err4) return res.status(500).json({ error: 'Failed' });
                    const moodCount = {};
                    entries.forEach(e => { moodCount[e.mood] = (moodCount[e.mood] || 0) + 1; });
                    const topMood = Object.keys(moodCount).sort((a, b) => moodCount[b] - moodCount[a])[0] || 'None';
                    res.json({ users, entries, feedback, growth, topMood, moodCount });
                });
            });
        });
    });
});

router.get('/user/:id/entries', verifyAdmin, (req, res) => {
    // Returns mood and date only — no text
    db.query('SELECT id, user_id, mood, created_at FROM entries WHERE user_id = ? ORDER BY created_at DESC',
        [req.params.id],
        (err, entries) => {
            if (err) return res.status(500).json({ error: 'Failed' });
            res.json(entries);
        }
    );
});

router.delete('/user/:id', verifyAdmin, (req, res) => {
    db.query('DELETE FROM growth_responses WHERE user_id = ?', [req.params.id], () => {
        db.query('DELETE FROM feedback WHERE user_id = ?', [req.params.id], () => {
            db.query('DELETE FROM entries WHERE user_id = ?', [req.params.id], (err) => {
                if (err) return res.status(500).json({ error: 'Failed' });
                db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err2) => {
                    if (err2) return res.status(500).json({ error: 'Failed' });
                    res.json({ message: 'User deleted' });
                });
            });
        });
    });
});

router.delete('/entry/:id', verifyAdmin, (req, res) => {
    db.query('DELETE FROM entries WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed' });
        res.json({ message: 'Entry deleted' });
    });
});

router.put('/entry/:id', verifyAdmin, (req, res) => {
    const { mood } = req.body;
    // Admin can only update mood — not text
    db.query('UPDATE entries SET mood = ? WHERE id = ?', [mood, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed' });
        res.json({ message: 'Entry updated' });
    });
});

router.delete('/feedback/:id', verifyAdmin, (req, res) => {
    db.query('DELETE FROM feedback WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed' });
        res.json({ message: 'Feedback deleted' });
    });
});

router.get('/export', verifyAdmin, (req, res) => {
    // Export mood and date only — no journal text
    db.query(`SELECT e.id, u.name, u.email, e.mood, e.created_at FROM entries e JOIN users u ON e.user_id = u.id ORDER BY e.created_at DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Failed' });
            const headers = ['ID', 'Name', 'Email', 'Mood', 'Date'];
            const rows = results.map(r => [
                r.id, r.name, r.email, r.mood,
                new Date(r.created_at).toLocaleDateString()
            ].join(','));
            const csv = [headers.join(','), ...rows].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=seeyourself-moods.csv');
            res.send(csv);
        }
    );
});

module.exports = router;