const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const podcastSchema = new Schema(
  {
    name: { type: String, require: true },
    image: { type: String, require: true },
    likes: { type: Number, default: 0 },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Podcast', podcastSchema);
