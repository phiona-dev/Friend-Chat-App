require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');

const app = express();

const allowedOrigins = [
	process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
	'http://localhost:3001',
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Routes
app.use('/api/lostfound', require('./routes/lostfound'));

const port = process.env.PORT || 5000;

connectDB()
	.then(() => {
		app.listen(port, () => {
			console.log(`Backend listening on port ${port}`);
		});
	})
	.catch((err) => {
		console.error('Failed to connect to database', err);
		process.exit(1);
	});

