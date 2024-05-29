const {
  fetchTopics,
  fetchArticleById,
  fetchArticles,
  fetchArticleCommentsById,
  insertCommentToArticle,
  changeVoteAmount,
} = require("./app.models");

const { checkUserExists } = require("./users.models");

module.exports = {
  fetchTopics,
  fetchArticleById,
  fetchArticles,
  fetchArticleCommentsById,
  insertCommentToArticle,
  checkUserExists,
  changeVoteAmount,
};
