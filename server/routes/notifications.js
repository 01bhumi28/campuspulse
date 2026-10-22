const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET /api/notifications - List all notifications
router.get('/', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });
    res.json(db.notifications || []);
});

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });

    db.notifications = (db.notifications || []).map(n => ({ ...n, unread: false }));
    store.saveDatabase(db);

    res.json({ message: 'All notifications marked as read', notifications: db.notifications });
});

// PUT /api/notifications/:id/read - Mark single notification as read
router.put('/:id/read', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });

    const notif = (db.notifications || []).find(n => n.id.toLowerCase() === req.params.id.toLowerCase());
    if (notif) notif.unread = false;

    store.saveDatabase(db);
    res.json({ message: 'Notification marked read', notification: notif });
});

module.exports = router;
