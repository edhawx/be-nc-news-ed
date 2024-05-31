const express = require('express');
const {
  getArticleById,
  getArticles,
  getArticleComments,
  postCommentToArticle,
  updateVotesInArticle,
} = require('../controllers/index');

const router = express.Router();

router.get('/:article_id', getArticleById);
router.get('/', getArticles);
router.get('/:article_id/comments', getArticleComments);
router.post('/:article_id/comments', postCommentToArticle);
router.patch('/:article_id', updateVotesInArticle);

module.exports = router;