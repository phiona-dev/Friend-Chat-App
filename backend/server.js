const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/database");
require("dotenv").config();

//initialize express app
const app = express();
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

//basic route to test server
app.get("/", (req, res) => {
    res.json({ message: "Friend Chat Backend is running!" });
})

//chat routes
app.use("api/chats", require("./routes/chats"));

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