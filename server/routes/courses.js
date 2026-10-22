const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET /api/courses - List all enrolled courses
router.get('/', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });
    res.json(db.courses || []);
});

// GET /api/courses/:id - Course detail & syllabus
router.get('/:id', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });
    const course = (db.courses || []).find(c => c.id.toLowerCase() === req.params.id.toLowerCase());
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
});

module.exports = router;
