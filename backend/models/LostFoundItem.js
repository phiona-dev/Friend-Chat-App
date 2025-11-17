const { Schema, model } = require('mongoose');

const LostFoundItemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['id', 'phone', 'keys', 'book', 'laptop', 'bag', 'clothing', 'other'],
      default: 'other',
      index: true,
    },
    status: { type: String, enum: ['lost', 'found', 'claimed'], default: 'lost', index: true },
    location: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    imageUrl: { type: String },
    reporterName: { type: String, trim: true },
    reporterEmail: { type: String, trim: true },
  },
  { timestamps: true }
);

LostFoundItemSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = model('LostFoundItem', LostFoundItemSchema);
