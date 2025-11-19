const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    participants: [{
        userId: {
            type: String,
            required: true
        },
        pseudonym: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            default: "",
        },
        isOnline: {
            type: Boolean,
            default: false
        }
    }],

    //store the last message for quick access in chat list
    lastMessage: {
        content: String,
        senderId: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    },

    //track unread messages per user
    unreadCounts: {
        type: Map,
        of: Number,
        default: {}
    },

    //when the chat was created
    createdAt: {
        type: Date,
        default: Date.now
    },

    //when the last activity happened(message, sent, ...)
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

//update the updatedAt timestamp before saving
chatSchema.pre("save", function(next) {
    this.updatedAt = Date.now();
    next();
});

//add a method to get the other participant in a chat
chatSchema.methods.getOtherParticipant = function(currentUserId) {
    return this.participants.find(
        participant => participant.userId !== currentUserId
    );
}

//method to update unread count
chatSchema.methods.incrementUnreadCount = function(userId) {
    const currentCount = this.unreadCounts.get(userId) || 0;
    this.unreadCounts.set(userId, currentCount + 1);
}

//method to reset unread count
chatSchema.methods.resetUnreadCount = function(userId) {
    this.unreadCounts.set(userId, 0);
}

module.exports = mongoose.model("Chat", chatSchema);