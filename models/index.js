const {
  fetchTopics,
  fetchArticleById,
  fetchArticles,
  fetchArticleCommentsById,
  insertCommentToArticle,
  changeVoteAmount,
  removeCommentById,
} = require("./app.models");

const { checkUserExists, checkCommentExists } = require("./checker.models");

module.exports = {
  fetchTopics,
  fetchArticleById,
  fetchArticles,
  fetchArticleCommentsById,
  insertCommentToArticle,
  checkUserExists,
  changeVoteAmount,
  removeCommentById,
  checkCommentExists,
};
