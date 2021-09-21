const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    content: String,
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    likes: { type: Number, default: 0 },
    author: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
