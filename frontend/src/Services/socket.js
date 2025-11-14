import { io } from "socket.io-client";

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    connect() {
        if (this.socket) return this.socket;

        this.socket = io("http://localhost: 5000", {
            transports: ["websocket"],
        });

        this.socket.on("connect", () => {
            console.log("Connected to server");
            this.isConnected = true;
        });

        this.socket.on("disconnect", () => {
            console.log("Disconnected from server");
            this.isConnected = false;
        });
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    //join a chat room
    joinChat(chatId) {
        if (this.socket) {
            this.socket.emit("join_chat", chatId);
        }
    }

    //leave a chat room
    leaveChat(chatId) {
        if (this.socket) {
            this.socket.emit("leave_chat", chatId)
        }
    }

    //send a message
    sendMessage(messageData) {
        if (this.socket) {
            this.socket.emit("send_message", messageData)
        }
    }

    //typing indicators
    startTyping(chatId, userId) {
        if (this.socket) {
            this.socket.emit("typing_start", { chatId, userId });
        }
    }

    stopTyping(chatId, userId) {
        if (this.socket) {
            this.socket.emit("typing_stop", { chatId, userId });
        }
    }

    //online status
    setUserOnline(userId) {
        if (this.socket) {
            this.socket.emit("user_online", userId)
        }
    }

    //listen for events
    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    //remove event listener
    off(event, callback) {
        if(this.socket) {
            this.socket.off(event, callback);
        }
    }
}

export const socketService = new SocketService();