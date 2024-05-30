const e = require("express");
const models = require("../models/index");
const path = require("path");
const fs = require("fs");

exports.getTopics = (req, res, next) => {
  const validParams = [];
  const queryKeys = Object.keys(req.query);

  const invalidParam = queryKeys.some((key) => !validParams.includes(key));

  if (invalidParam) {
    res
      .status(400)
      .send({ msg: "400 - Bad request, invalid topic parameters" });
  } else {
    models
      .fetchTopics()
      .then((topics) => {
        res.status(200).send({topics});
      })
      .catch((err) => {
        next(err);
      });
  }
};

exports.getApi = (req, res, next) => {
  const filePath = path.join(__dirname, "..", "endpoints.json");
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading endpoints");
      next(err);
    } else {
      try {
        const endpoints = JSON.parse(data);
        res.status(200).send({ endpoints });
      } catch (parseErr) {
        next(parseErr);
      }
    }
  });
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  models
    .fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  const validParams = ["sort_by", "order", "topic"];
  const queryKeys = Object.keys(req.query);
  const invalidParams = queryKeys.some((key) => !validParams.includes(key));

  if (invalidParams) {
    return next({ status: 400, msg: "400 - Bad request, invalid parameters" });
  }

  models
    .fetchArticles(sort_by, order, topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  models
    .fetchArticleCommentsById(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentToArticle = (req, res, next) => {
  const newComment = req.body;

  const { username, body } = newComment;
  const { article_id } = req.params;

  if (isNaN(article_id)) {
    return next({
      status: 400,
      msg: `400 - Bad request, invalid type: ${article_id}`,
    });
  }

  if (!body || body.trim().length === 0) {
    return next({
      status: 400,
      msg: `400 - Bad request, you haven't typed a comment!`,
    });
  }

  Promise.all([
    models.checkUserExists(username),
    models.fetchArticleById(article_id),
  ])
    .then(() => {
      const commentData = {
        body,
        author: username,
        article_id: article_id,
        votes: 0,
        created_at: new Date().toISOString(),
      };
      return models.insertCommentToArticle(commentData);
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.updateVotesInArticle = (req, res, next) => {
  const { inc_votes } = req.body;
  const { article_id } = req.params;


  if (!inc_votes) {
    return next({
      status: 400,
      msg: `400 - Bad request, must enter inc_votes: Number`,
    });
  }

  if (typeof inc_votes !== "number") {
    return next({
      status: 400,
      msg: `400 - Bad request, inc_votes MUST be number`,
    });
  }

  models
    .changeVoteAmount(article_id, inc_votes)
    .then(() => {
      return models.fetchArticleById(article_id); 
    })
    .then((updatedArticle) => {
      res.status(200).send({ article: updatedArticle });
    })
    .catch(next);
};

exports.deleteByCommentId = (req, res, next) => {
  const { comment_id } = req.params;

  if (isNaN(Number(comment_id))) {
    return next({
      status: 400,
      msg: "400 - Bad request, comment_id must be a number",
    });
  }

  const commentId = Number(comment_id);

  models
    .checkCommentExists(commentId)
    .then(() => {
      models.removeCommentById(commentId).then(() => {
        res.status(204).send();
      });
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  const validParams = [];
  const queryKeys = Object.keys(req.query);

  const invalidParam = queryKeys.some((key) => !validParams.includes(key));

  if (invalidParam) {
    res.status(400).send({ msg: "400 - Bad request, invalid user parameters" });
  } else {
    models
      .fetchUsers()
      .then((users) => {
        res.status(200).send({users});
      })
      .catch((err) => {
        next(err);
      });
  }
};
