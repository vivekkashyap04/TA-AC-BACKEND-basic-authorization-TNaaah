var express = require('express');
var router = express.Router();

const User = require('../models/user');
const Product = require('../models/product');
var auth = require('../middleware/auth');

console.log('inside users route');
/* GET users listing. */
router.get('/', auth.loggdInUser, function (req, res, next) {
  console.log(req.session);
  User.findOne({ _id: req.session.userId }, (err, user) => {
    if (user.isAdmin) {
      Product.find({ userId: user._id }, (err, data) => {
        console.log(data);
        if (err) return next(err);
        res.render('dashboard', { user, data });
      });
    } else {
      let query = {};
      if (req.query.category) {
        query.category = req.query.category;
      }
      Product.find(query, (err, data) => {
        console.log(data);
        if (err) return next(err);
        res.render('dashboard', { user, data });
      });
    }
  });
});

//register

router.get('/register', function (req, res, next) {
  console.log(req.body, 'user register');
  var error = req.flash('error')[0];
  res.render('registration', { error });
  // if (next) return next(err);
});

router.post('/register', function (req, res, next) {
  var { email, password } = req.body;
  req.body.role = req.body.role.toLowerCase().trim();
  if (password < 5) {
    req.flash('error', 'password is too short');
    res.redirect('/users/register');
  }
  User.findOne({ email }, (err, user) => {
    if (user) {
      req.flash('error', 'email is already exist');
      res.redirect('/users/register');
    } else {
      User.create(req.body, (err, data) => {
        if (err) return next(err);
        res.redirect('/users/login');
      });
    }
  });
});

//login
router.get('/login', function (req, res, next) {
  var error = req.flash('error')[0];
  res.render('login', { error });
});

router.post('/login', function (req, res, next) {
  var { email, password } = req.body;
  if (!email || !password) {
    req.flash('error', 'Email/Password is required');
    return res.redirect('/users/login');
  }
  User.findOne({ email }, (err, user) => {
    console.log(user);
    if (!user) {
      req.flash('error', 'user have to register first');
      return res.redirect('/users/login');
    }
    user.verifyPassword(password, (err, result) => {
      console.log(err, result);
      if (!result) {
        req.flash('error', 'password is incorrect');
        res.redirect('/users/login');
      }
      req.session.userId = user._id;
      req.session.isAdmin = user.isAdmin;
      res.redirect('/users');
    });
  });
});
router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/users/login');
});

module.exports = router;
