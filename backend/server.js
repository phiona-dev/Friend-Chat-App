require('dotenv').config({ override: true });
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/database");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
	process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
	'http://localhost:3001',
];

// Middleware
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Socket.io setup
const io = socketIo(server, {
	cors: {
		origin: allowedOrigins,
		methods: ["GET", "POST"]
	}
});

// Basic routes
app.get("/", (req, res) => {
	res.json({ message: "Friend Chat Backend is running!" });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// API Routes
app.use('/api/lostfound', require('./routes/lostfound'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/users', require('./routes/user'));

// Socket.io connection handler
io.on("connection", (socket) => {
	console.log("User connected:", socket.id);

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
	})
});

// Start server
const port = process.env.PORT || 5000;

connectDB()
	.then(() => {
		server.listen(port, () => {
			console.log(`Backend listening on port ${port}`);
		});
	})
	.catch((err) => {
		console.error('Failed to connect to database', err);
		process.exit(1);
	});
