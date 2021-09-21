const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  password: String,
  city: String,
  articles: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
  fullName: String,
});

userSchema.pre('save', function (next) {
  this.fullName = this.firstName + '' + this.lastName;
  if (this.password && this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, password) => {
      this.password = password;
      return next();
    });
  } else {
    next();
  }
});

userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result);
  });
};

module.exports = mongoose.model('User', userSchema);
