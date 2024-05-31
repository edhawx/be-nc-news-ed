const { fetchTopics } = require("./topics.models");
const { fetchArticles, fetchArticleById, fetchArticleCommentsById } = require("./articles.models");
const { fetchUsers, checkUserExists } = require("./users.models");
const { removeCommentById, insertCommentToArticle, checkCommentExists } = require("./comments.models");
const { changeVoteAmount } = require("./votes.models");

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
  fetchUsers,
};