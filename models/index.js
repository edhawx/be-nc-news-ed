const { fetchTopics } = require("./topics.models");
const { fetchArticles, fetchArticleById, fetchArticleCommentsById, insertNewArticle } = require("./articles.models");
const { fetchUsers, checkUserExists, fetchUserByUsername } = require("./users.models");
const { removeCommentById, insertCommentToArticle, checkCommentExists } = require("./comments.models");
const { changeVoteAmount, changeCommentVoteAmount } = require("./votes.models");

module.exports = {
  fetchTopics,
  fetchArticleById,
  fetchArticles,
  fetchArticleCommentsById,
  insertNewArticle,
  insertCommentToArticle,
  checkUserExists,
  fetchUserByUsername,
  changeVoteAmount,
  changeCommentVoteAmount,
  removeCommentById,
  checkCommentExists,
  fetchUsers,
};