const e = require("express");
const models = require("../models/index");
const path = require("path");
const fs = require("fs");

exports.getTopics = (req, res, next) => {
  const validParams = [];
  const queryKeys = Object.keys(req.query);

  const invalidParam = queryKeys.some((key) => !validParams.includes(key));

  if (invalidParam) {
    res.status(400).send({ msg: "400 - Bad request" });
  } else {
    models
      .fetchTopics()
      .then((topics) => {
        res.status(200).send({ topics });
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
  const { sort_by, order } = req.query;
  const validParams = ["sort_by", "order"];
  const queryKeys = Object.keys(req.query);
  const invalidParams = queryKeys.some((key) => !validParams.includes(key));

  if (invalidParams) {
    return next({ status: 400, msg: "400 - Bad request, invalid parameters" });
  }

  models
    .fetchArticles(sort_by, order)
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
    return next({ status: 400, msg: "400 - Bad request, invalid type" });
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
        article_id,
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
