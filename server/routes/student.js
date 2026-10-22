const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET /api/student - Get student profile and academic metrics
router.get('/', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });
    res.json({
        student: db.student,
        stats: db.stats,
        performanceData: db.performanceData
    });
});

// PUT /api/student - Update student profile fields
router.put('/', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });

    db.student = {
        ...db.student,
        ...req.body,
        id: db.student.id // Ensure ID cannot be changed
    };

    store.saveDatabase(db);
    res.json({ message: 'Student profile updated successfully', student: db.student });
});

module.exports = router;
