const express = require('express');
const Article = require('../models/article');
const Comment = require('../models/comment');
const auth = require('../middleware/auth');

const router = express.Router();

// Increment Likes

router.get('/:id/like', (req, res, next) => {
  let id = req.params.id;

  Comment.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, comment) => {
    if (err) return next(err);
    let articleId = comment.articleId;
    Article.findById(articleId, (err, article) => {
      if (err) return next(err);
      let givenSlug = article.slug;
      res.redirect('/articles/' + givenSlug);
    });
  });
});

router.use(auth.loggdInUser);

router.post('/:id', (req, res, next) => {
  let id = req.params.id;
  Comment.findByIdAndUpdate(id, req.body, (err, updatedComment) => {
    if (err) return next(err);
    let articleId = updatedComment.articleId;
    Article.findById(articleId, (err, article) => {
      if (err) return next(err);
      let givenSlug = article.slug;
      res.redirect('/articles/' + givenSlug);
    });
  });
});

router.get('/:id/edit', (req, res, next) => {
  let id = req.params.id;
  Comment.findById(id, (err, comment) => {
    if (err) return next(err);
    res.render('updateComment', { comment });
  });
});

router.get('/:id/delete', (req, res, next) => {
  let id = req.params.id;
  Comment.findByIdAndRemove(id, (err, deletedComment) => {
    if (err) return next(err);
    Article.findByIdAndUpdate(
      deletedComment.articleId,
      { $pull: { comments: deletedComment._id } },
      (err, article) => {
        if (err) return next(err);
        let givenSlug = article.slug;
        res.redirect('/articles/' + givenSlug);
      }
    );
  });
});

module.exports = router;
