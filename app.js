const express = require("express");
const app = express();
const pool = require("./db/connection");
const {
  getTopics,
  getApi,
  getArticleById,
  getArticles,
  getArticleComments,
} = require("./controllers/app.controllers");
const e = require("express");

app.get("/api/topics", getTopics);

app.get("/api", getApi);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22P02" || err.code === "23502") {
    res.status(400).send({ msg: "400 - Bad request" });
  } else {
    res.status(500).send({ msg: "500 - Internal Server Error" });
  }
});

app.use((req, res, next) => {
  res.status(404).send({ msg: "404 - Not found" });
});

module.exports = app;
