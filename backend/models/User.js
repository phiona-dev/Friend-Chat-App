const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, trim: true },
    pseudonym: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    about: { type: String, trim: true },
    interests: { type: [String], default: [] },
    avatar: { type: String },
  },
  { timestamps: true }
);

module.exports = model('User', UserSchema);