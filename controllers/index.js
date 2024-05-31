const { getTopics } = require("./topics.controllers");
const {
  getArticleById,
  getArticles,
  getArticleComments,
  updateVotesInArticle,
} = require("./articles.controllers");
const { deleteByCommentId, postCommentToArticle, } = require("./comments.controllers");
const { getUsers } = require("./users.controllers");
const { getApi } = require("./api.controllers");

module.exports = {
  getTopics,
  getArticleById,
  getArticles,
  getArticleComments,
  postCommentToArticle,
  updateVotesInArticle,
  deleteByCommentId,
  getUsers,
  getApi,
};
