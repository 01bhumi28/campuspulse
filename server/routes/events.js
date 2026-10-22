const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET /api/events - List campus events
router.get('/', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });
    res.json(db.events || []);
});

// POST /api/events/:id/rsvp - Toggle RSVP registration
router.post('/:id/rsvp', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });

    const index = (db.events || []).findIndex(e => e.id.toLowerCase() === req.params.id.toLowerCase());
    if (index === -1) return res.status(404).json({ error: 'Event not found' });

    const event = db.events[index];
    const newStatus = !event.isRsvpd;
    event.isRsvpd = newStatus;
    event.attendees = (event.attendees || 0) + (newStatus ? 1 : -1);

    store.saveDatabase(db);
    res.json({
        message: newStatus ? 'RSVP Confirmed!' : 'RSVP Cancelled',
        event
    });
});

module.exports = router;
