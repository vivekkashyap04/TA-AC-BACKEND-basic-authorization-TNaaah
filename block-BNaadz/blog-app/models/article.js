var mongoose = require('mongoose');
let slugger = require('slug');

var Schema = mongoose.Schema;

var articleSchema = new Schema({
  title: String,
  description: String,
  tags: [String],
  likes: { type: Number, default: 0 },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  slug: { type: String, unique: true },
});

articleSchema.pre('save', function (next) {
  this.slug = slugger(this.title);
  if (!this.likes) {
    this.likes = 0;
  }
  next();
});

var Article = mongoose.model('Article', articleSchema);

module.exports = Article;
