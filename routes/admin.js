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

// Get all data
router.get('/data', verifyAdmin, (req, res) => {
    db.query('SELECT id, name, email, created_at FROM users', (err, users) => {
        if (err) return res.status(500).json({ error: 'Failed' });
        db.query('SELECT * FROM entries ORDER BY created_at DESC', (err2, entries) => {
            if (err2) return res.status(500).json({ error: 'Failed' });
            const moodCount = {};
            entries.forEach(e => { moodCount[e.mood] = (moodCount[e.mood] || 0) + 1; });
            const topMood = Object.keys(moodCount).sort((a,b) => moodCount[b] - moodCount[a])[0] || 'None';
            res.json({ users, entries, topMood, moodCount });
        });
    });
});

// Delete user
router.delete('/user/:id', verifyAdmin, (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM entries WHERE user_id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to delete entries' });
        db.query('DELETE FROM users WHERE id = ?', [id], (err2) => {
            if (err2) return res.status(500).json({ error: 'Failed to delete user' });
            res.json({ message: 'User deleted successfully' });
        });
    });
});

// Delete entry
router.delete('/entry/:id', verifyAdmin, (req, res) => {
    db.query('DELETE FROM entries WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to delete entry' });
        res.json({ message: 'Entry deleted successfully' });
    });
});

// Export CSV
router.get('/export', verifyAdmin, (req, res) => {
    db.query(`
        SELECT e.id, u.name, u.email, e.mood, e.text, e.created_at 
        FROM entries e 
        JOIN users u ON e.user_id = u.id 
        ORDER BY e.created_at DESC
    `, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed' });
        const headers = ['ID', 'Name', 'Email', 'Mood', 'Entry', 'Date'];
        const rows = results.map(r => [
            r.id,
            r.name,
            r.email,
            r.mood,
            `"${r.text.replace(/"/g, '""')}"`,
            new Date(r.created_at).toLocaleDateString()
        ].join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=seeyourself-entries.csv');
        res.send(csv);
    });
});

module.exports = router;