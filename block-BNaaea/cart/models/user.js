const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: true },
  role:String,
  product:[{type:Schema.Types.ObjectId,ref:'Product'}]
});

userSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, password) => {
      if (err) return next(err);
      this.password = password;
      if (this.role != 'admin') {
        this.isAdmin = false;
      }
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
