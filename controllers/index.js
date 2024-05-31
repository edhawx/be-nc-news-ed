const { getTopics } = require("./topics.controllers");
const {
  getArticleById,
  getArticles,
  getArticleComments,
  updateVotesInArticle,
  postNewArticle,
} = require("./articles.controllers");
const { deleteByCommentId, postCommentToArticle, patchCommentVotesByCommentId } = require("./comments.controllers");
const { getUsers, getUserByUsername } = require("./users.controllers");
const { getApi } = require("./api.controllers");

module.exports = {
  getTopics,
  getArticleById,
  getArticles,
  getArticleComments,
  postCommentToArticle,
  updateVotesInArticle,
  postNewArticle,
  deleteByCommentId,
  patchCommentVotesByCommentId,
  getUsers,
  getUserByUsername,
  getApi,
};
