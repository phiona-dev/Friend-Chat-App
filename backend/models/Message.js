const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    //reference to the chat this message belongs to
    chatId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        require: true
    },

    //who sent the message
    senderId: {
        type: String,
        required: true
    },

    //message content
    content: {
        type: String,
        required: true
    },

    //type of message(text, image, system notification)
    messageType: {
        type: String,
        enum: ["text", "image", "system"],
        default: "text"
    },

    //for image messages - store the image url
    imageUrl: {
        type: String,
        default: ""
    },

    //whether the message has been read
    isRead: {
        type: Boolean,
        default: false
    },

    //track who has read the message and when
    readBy: [{
        userId: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    //when the message was sent
    timestamp: {
        type: Date,
        default: Date.now
    }
});

//create an index for faster queries by chatId and timestamp
messageSchema.index({ chatId: 1, timestamp: 1 });

//method to mark message as read by a user
messageSchema.methods.markAsRead = function(userId){
    if (!this.isRead){
        this.isRead = true;
    }

    //add to readby array if not already there
    const alreadyRead = this.readBy.some(reader => reader.userId === userId);
    if (!alreadyRead){
        this.readBy.push({ userId, timestamp: new Date() })
    }
}

//static method to get unread messages count for a user in a chat
messageSchema.statics.getUnreadCount = async function(chatId, userId) {
    return await this.countDocuments({
        chatId: chatId,
        senderId: { $ne: userId }, //messages not sent by the user
        isRead: false
    })
}

module.exports = mongoose.model("Message", messageSchema);