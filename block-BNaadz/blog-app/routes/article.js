var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Article = require('../models/user');
const Comment = require('../models/comment');
const auth = require('../middleware/auth');

router.get('/', (req, res, next) => {
  Article.find({}, (err, articles) => {
    res.render('articleList', { articles: articles });
  });
});

router.get('/new', auth.loggdInUser, (req, res) => {
  if (req.session.userId) {
    res.render('addArticle');
  } else {
    req.flash('error', 'You must login to create new article');
    res.redirect('/users/login');
  }
});

router.get('/:slug', (req, res, next) => {
  let givenSlug = req.params.slug;
  var error = req.flash('error')[0];
  Article.findOne({ slug: givenSlug })
    .populate('comments')
    .populate('author', 'fullName email')
    .exec((err, article) => {
      if (err) return next(err);
      Comment.find({ articleId: article.id })
        .populate('author', 'fullName')
        .exec((err, comments) => {
          if (err) return next(err);
          res.render('articleDetails', { article, comments, error });
        });
    });
});

// Increment Likes
router.get('/:slug/likes', (req, res, next) => {
  let givenSlug = req.params.slug;

  Article.findOneAndUpdate(
    { slug: givenSlug },
    { $inc: { likes: 1 } },
    (err, article) => {
      if (err) return next(err);
      res.redirect('/articles/' + givenSlug);
    }
  );
});

router.use(auth.loggdInUser);

router.get('/:slug/edit', (req, res, next) => {
  let slug = req.params.slug;
  Article.findOne({ slug: slug }, (err, article) => {
    if (err) return next(err);
    if (req.user.id !== article.author.toString()) {
      req.flash('error', 'You Are Not Authorised to Edit this Article!');
      res.redirect('/articles/' + slug);
    } else {
      Article.findOne({ slug: slug }, (err, article) => {
        console.log(article);
        if (err) return next(err);
        res.render('editArticle', { article });
      });
    }
  });
});

router.post('/', (req, res, next) => {
  req.body.author = req.session.userId;
  Article.create(req.body, (err, createdArticle) => {
    console.log(createdArticle);
    if (err) return next(err);
    res.redirect('/articles');
  });
});
// Update Article
router.post('/:slug', (req, res, next) => {
  let givenSlug = req.params.slug;
  req.body.tags = req.body.tags.trim().split(' ');
  Article.findOneAndUpdate(
    { slug: givenSlug },
    req.body,
    (err, updatedArticle) => {
      if (err) return next(err);
      res.redirect('/articles');
    }
  );
});
// Delete Article
router.get('/:slug/delete', (req, res, next) => {
  let givenSlug = req.params.slug;
  Article.findOne({ slug: givenSlug }, (err, article) => {
    if (err) return next(err);
    if (req.user.id !== article.author.toString()) {
      req.flash('error', 'You Are Not Authorised to Delete this Article!');
      res.redirect('/articles/' + givenSlug);
    } else {
      Article.findOneAndDelete({ slug: givenSlug }, (err, deletedArticle) => {
        if (err) return next(err);
        Comment.deleteMany({ articleId: deletedArticle._id }, (err, info) => {
          if (err) return next(err);
          res.redirect('/articles');
        });
      });
    }
  });
});
// Add comment
router.post('/:id/comments', (req, res, next) => {
  let id = req.params.id;
  req.body.articleId = id;
  req.body.author = req.session.userId;
  Comment.create(req.body, (err, comment) => {
    if (err) return next(err);
    Article.findByIdAndUpdate(
      id,
      { $push: { comments: comment._id } },
      (err, updatedArticle) => {
        if (err) return next(err);
        let givenSlug = updatedArticle.slug;
        res.redirect('/articles/' + givenSlug);
      }
    );
  });
});

module.exports = router;
