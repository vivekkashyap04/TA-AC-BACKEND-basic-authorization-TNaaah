var express = require('express');
var router = express.Router();

const User = require('../models/user');
const Product = require('../models/product');
var auth = require('../middleware/auth');

router.get('/new', (req, res, next) => {
  console.log(req.session.userId);
  if (req.session.isAdmin) {
    res.render('product');
  }
});

router.post('/', (req, res, next) => {
  if (req.session.userId) {
    req.body.userId = req.session.userId;
    Product.create(req.body, (err, products) => {
      if (err) return next(err);
      User.findByIdAndUpdate(
        req.session.userId,
        { $push: { product: products.userId } },
        (err, data) => {
          res.redirect('/users');
        }
      );
    });
  }
});

router.get('/:id', (req, res, next) => {
  var admin = req.session.isAdmin;
  var id = req.params.id;
  Product.findById(id, (err, product) => {
    if (err) return next(err);
    res.render('productDetail', { product, admin });
  });
});

router.get('/:id/edit', (req, res, next) => {
  var id = req.params.id;
  Product.findById(id, (err, product) => {
    if (err) return next(err);
    res.render('updateproduct', { product });
  });
});

router.get('/:id/likes', (req, res, next) => {
  var id = req.params.id;
  Product.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, product) => {
    if (err) return next(err);
    res.redirect('/products/' + id);
  });
});

router.post('/:id', (req, res, next) => {
  var id = req.params.id;
  Product.findByIdAndUpdate(id, req.body, (err, product) => {
    if (err) return next(err);
    res.redirect('/products/' + id);
  });
});

router.get('/:id/delete', (req, res, next) => {
  var id = req.params.id;
  Product.findByIdAndDelete(id, (err, product) => {
    if (err) return next(err);
    User.findByIdAndUpdate(
      req.session.userId,
      { $pull: { product: product._id } },
      (err, data) => {
        res.redirect('/users');
      }
    );
  });
});

router.get('/products/:id/addproduct', (req, res, next) => {
  if (req.session.isAdmin === 'false' && req.session.userId) {
    let itemId = req.params.id;

    let userId = req.session.userId;

    User.findByIdAndUpdate(
      userId,
      { $push: { cart: itemId } },
      (err, updated) => {
        if (err) return next(err);

        res.redirect('/products/cart');
      }
    );
  } else {
    req.flash('error', 'you must login as admin');
    return res.redirect('/home');
  }
});

//getting cart items

router.get('/products/cart', (req, res, next) => {
  if (req.session.isAdmin === false) {
    let userId = req.session.userId;

    User.findById(userId)
      .populate('product')
      .exec((err, user) => {
        if (err) return next(err);
        let total = user.cart.reduce((acc, cv) => {
          acc = acc + cv.price;
          return acc;
        }, 0);
        res.render('clientCart', { user, total });
      });
  } else {
    req.flash('error', 'you must login as admin');
    return res.redirect('/users');
  }
});

module.exports = router;
