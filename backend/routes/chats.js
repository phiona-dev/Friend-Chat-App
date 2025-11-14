const express = require('express');
const router = express.Router();
const Chat = require("../models/Chat")
const Message = require("../models/Message");

//GET /api/chats/:userId - get all chats for a user
router.get("/:userId", async (req, res) => {
    console.log('GET /api/chats called for user:', req.params.userId);
    try {
        const { userId } = req.params;
        console.log('Looking for chats for user:', userId);

        //find all chats where the user is a participant
        const chats = await Chat.find({
            "participants.userId": userId
        }).sort({ updatedAt: -1 })//most recent first

        //for each chat, get the last message and unread count
        const chatWithDetails = await Promise.all(
            chats.map(async (chat) => {
                //get the last message
                const lastMessage = await Message.findOne(
                    { chatId: chat._id },
                    {},
                    { sort: {timestamp: -1 } }
                );

                //get unread message count for this user
                const unreadCount = await Message.countDocuments({
                    chatId: chat._id,
                    senderId: { $ne: userId }, //messages from others
                    isRead: false
                });

                //get the other participant's info
                const otherParticipant = chat.participants.find(
                    p => p.userId !== userId
                );

                return {
                    chatId: chat._id,
                    participants: chat.participants,
                    lastMessage: lastMessage ? {
                        content: lastMessage.content,
                        timestamp: lastMessage.timestamp,
                        senderId: lastMessage.senderId
                    } : null,
                    unreadCount,
                    otherParticipant, // easy access to who we are chatting with
                    updatedAt: chat.updatedAt,
                    createdAt: chat.createdAt
                };
            })
        );

        res.json(chatWithDetails);
    } catch (error) {
        console.error("Error fetching chats:", error)
        res.status(500).json({ error: "Failed to fetch chats" });
    }
});

//GET /api/chats/messages/:chatId - get messages for a specific chat
router.get("/messages/:chatId", async (req, res) => {
    try {
        const { chatId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        //verify the chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        //get messages with pagination
        const messages = await Message.find({ chatId })
        .sort({ timestamp: 1 }) //oldest first for chat history
        .limit(limit * 1)
        .skip((page - 1) * limit);

        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

//POST /api/chats - create a new chat (when users match)
router.post("/", async (req, res) => {
    try {
        const { participant1, participant2 } = req.body;

        //validate required fields
        if (!participant1 || participant2) {
            return res.status(400).json({ error: "Both participants are required" });
        }

        //check if chat already exists between these users
        const existingChat = await Chat.findOne({
            "participants.userId": {
                $all: [participant1.userId, participant2.userId]
            }
        });

        if (existingChat) {
            return res.json(existingChat)
        }

        //create a new chat
        const newChat = new Chat({
            participants: [participant1, participant2]
        });

        await newChat.save();

        //create a welcome system message
        const systemMessage = new Message({
            chatId: newChat._id,
            senderId: "system",
            content: `You matched with ${participant2.pseudonym}! Start a conversation.`,
            messageType: "system"
        });

        await systemMessage.save();

        //update chat with last message
        newChat.lastMessage = {
            content: systemMessage.content,
            senderId:systemMessage.senderId,
            timestamp: systemMessage.timestamp
        };
        await newChat.save();

        res.status(201).json(newChat);
    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({ error: "Failed to create chat" });
    }
});

//POST /api/chats/:chatId/messages - send a new message
router.post("/:chatId/messages", async (req, res) => {
    try {
        const { chatId } = req.params;
        const { senderId, content, messageType = "text" } = req.body;

        //validate required fields
        if (!senderId || !content) {
            return res.status(400).json({ error: "Sender ID and content are required" });
        }

        //verify chat exists and user is a participant
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        const isParticipant = chat.participants.some(p => p.userId === senderId);
        if(!isParticipant){
            return res.status(403).json({ error: "User is not a participant in this chat" });
        }

        //create new message
        const newMessage = new Message({
            chatId,
            senderId,
            content,
            messageType
        });

        await newMessage.save();

        //update chat's last message and timestamp
        chat.lastMessage = {
            content: newMessage.content,
            senderId: newMessage.senderId,
            timestamp: newMessage.timestamp
        };
        chat.updatedAt = new Date();

        //increment unread count for all other participants
        chat.participants.forEach(participant => {
            if (participant.userId !== senderId){
                chat.incrementUnreadCount(participant.userId);
            }
        });

        await chat.save();

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
});

// PUT /api/chats/:chatId/read - mark all messages as read
router.put("/:chatId/read", async (req, res) => {
    try {
        const { chatId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        //mark messages as read
        await Message.updateMany(
            {
                chatId,
                senderId: { $ne: userId }, //messages from others
                isRead: false
            },
            {
                isRead: true,
                $push: {
                    readBy: { userId, timestamp: new Date() }
                }
            }
        )

        //reset unread count for this user
        const chat = await Chat.findById(chatId);
        if (chat) {
            chat.resetUnreadCount(userId);
            await chat.save();
        }

        res.json({ message: "Messages marked as read" });
    } catch (error) {
        console.error("Error marking messages as read:", erro);
        res.status(500).json({ error: "Failed to mark messages as read" });
    }
});

//GET /api/chats/:chatId/participants - get chat participants
router.get("/:chatId/participants", async (req, res) => {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        res.json(chat.participants)
    } catch (error) {
        console.error("Error fetching participants:", error);
        res.status(500).json({ error: "Failed to fetch participants" });
    }
});


module.exports = router;