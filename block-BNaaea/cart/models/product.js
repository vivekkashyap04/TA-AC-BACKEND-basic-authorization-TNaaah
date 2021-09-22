const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: String,
  quantity: Number,
  price: Number,
  category: [String],
  likes: { type: Number, default: 0 },
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = mongoose.model('Product', productSchema);
