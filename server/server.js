const express = require('express');
const cors = require('cors');
const path = require('path');
const store = require('./data/store');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing for all origins (GitHub Pages, localhost, etc.)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logger for debugging during viva/demo
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// API Routes
app.use('/api/student', require('./routes/student'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/events', require('./routes/events'));
app.use('/api/notifications', require('./routes/notifications'));

// GET /api/data - Full database payload (for fast initial sync)
app.get('/api/data', (req, res) => {
    const db = store.getDatabase();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });
    res.json(db);
});

// GET /api/health - Server health status
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'CampusPulse Academic REST API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend static files from parent directory so http://localhost:5000 loads the entire app!
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🎓 CampusPulse REST API Server running on port ${PORT}`);
    console.log(`🔗 Local API:   http://localhost:${PORT}/api/health`);
    console.log(`🌐 Full App:    http://localhost:${PORT}/`);
    console.log('====================================================');
});
