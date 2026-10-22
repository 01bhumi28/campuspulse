const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET /api/schedule - Full week schedule
router.get('/', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });
    res.json(db.schedule || []);
});

// GET /api/schedule/:day - Schedule for specific day
router.get('/:day', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });
    const daySchedule = (db.schedule || []).find(s => s.day.toLowerCase() === req.params.day.toLowerCase());
    if (!daySchedule) return res.status(404).json({ error: 'Schedule not found for day' });
    res.json(daySchedule);
});

module.exports = router;
