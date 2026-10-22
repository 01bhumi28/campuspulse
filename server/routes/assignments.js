const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET /api/assignments - List all assignments
router.get('/', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });
    res.json(db.assignments || []);
});

// POST /api/assignments - Add a new assignment
router.post('/', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });

    const newAssignment = {
        id: `ASG-${Date.now().toString().slice(-4)}`,
        title: req.body.title || 'Untitled Assignment',
        courseId: req.body.courseId || 'CS301',
        courseCode: req.body.courseCode || 'CS 301',
        dueDate: req.body.dueDate || 'Next Week',
        dueIso: req.body.dueIso || new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        status: req.body.status || 'pending',
        priority: req.body.priority || 'medium',
        maxMarks: Number(req.body.maxMarks) || 100,
        marksReceived: null,
        description: req.body.description || '',
        submissionFile: null,
        feedback: null
    };

    db.assignments = db.assignments || [];
    db.assignments.unshift(newAssignment);
    store.saveDatabase(db);

    res.status(201).json({ message: 'Assignment created successfully', assignment: newAssignment });
});

// PUT /api/assignments/:id - Update assignment details or status
router.put('/:id', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });

    const index = (db.assignments || []).findIndex(a => a.id.toLowerCase() === req.params.id.toLowerCase());
    if (index === -1) return res.status(404).json({ error: 'Assignment not found' });

    db.assignments[index] = {
        ...db.assignments[index],
        ...req.body,
        id: db.assignments[index].id // preserve ID
    };

    store.saveDatabase(db);
    res.json({ message: 'Assignment updated successfully', assignment: db.assignments[index] });
});

// POST /api/assignments/:id/submit - Submit assignment work
router.post('/:id/submit', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });

    const index = (db.assignments || []).findIndex(a => a.id.toLowerCase() === req.params.id.toLowerCase());
    if (index === -1) return res.status(404).json({ error: 'Assignment not found' });

    const fileName = req.body.fileName || 'Assignment_Submission.pdf';
    db.assignments[index].status = 'submitted';
    db.assignments[index].submissionFile = fileName;
    db.assignments[index].feedback = 'Submitted successfully. Awaiting evaluation.';

    store.saveDatabase(db);
    res.json({ message: 'Work submitted successfully', assignment: db.assignments[index] });
});

module.exports = router;
