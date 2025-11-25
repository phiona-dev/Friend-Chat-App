const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	pseudonym: { type: String },
	content: { type: String, required: true },
	createdAt: { type: Date, default: Date.now }
}, { _id: false });

const PostSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	pseudonym: { type: String },
	title: { type: String },
	content: { type: String, required: true },
	category: { type: String, enum: ['Memes','Events','Questions','Announcements','General'], default: 'General' },
	imageUrl: { type: String },
	tags: [{ type: String }],
	likes: [{ type: String }],
	comments: [CommentSchema],
	reports: [{
		userId: String,
		reason: String,
		createdAt: { type: Date, default: Date.now }
	}]
}, { timestamps: true });

PostSchema.index({ content: 'text', title: 'text', tags: 'text' });

module.exports = mongoose.model('Post', PostSchema);
