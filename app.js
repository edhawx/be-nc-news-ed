const express = require("express");
const app = express();
const pool = require("./db/connection");
const { getTopics, getApi, getArticleById } = require("./controllers/app.controllers");
const e = require("express");

app.get("/api/topics", getTopics);

app.get("/api", getApi);

app.get("/api/articles/:article_id", getArticleById);

app.use((err, req, res, next) => {
  if (err.status === 400) {
    res.status(400).send({ msg: "400 - Bad request" });
  } else if (err.code === "22P02" || err.code === "23502") {
    res.status(400).send({ msg: "400 - Bad request " });
  } else {
    next(err);
  }
});

app.use((req, res, next) => {
  res.status(404).send({ msg: "404 - Not found" });
});

module.exports = app;
