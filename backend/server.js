require('dotenv').config({ override: true });
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/database");

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



//CHECK HERE!!!!!!!!!!
//initialize express app

const server = http.createServer(app);

//socket-io setup
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", //react app url
        methods: ["GET", "POST"]
    }
})

//connect to database
connectDB();

//middleware
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//basic route to test server
app.get("/", (req, res) => {
    res.json({ message: "Friend Chat Backend is running!" });
})

//chat routes
app.use("/api/chats", require("./routes/chats"));

//matches route (pending matches, accept/reject)
app.use("/api/matches", require("./routes/matches"));

//basic socket.io connection test
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    })
})

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
