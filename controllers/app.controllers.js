const e = require("express");
// const { fetchTopics, fetchArticleById } = require("../models/index");
const { fetchTopics, fetchArticleById } = require("../models/app.models");
const path = require("path");
const fs = require("fs");

exports.getTopics = (req, res, next) => {
  const validParams = [];
  const queryKeys = Object.keys(req.query);

  const invalidParam = queryKeys.some((key) => !validParams.includes(key));

  if (invalidParam) {
    res.status(400).send({ msg: "400 - Bad request" });
  } else {
    fetchTopics()
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

exports.getArticleById = (req,res,next)=>{
    const { article_id } = req.params;
    fetchArticleById(article_id)
    .then((article)=>{
        console.log({article})
        res.status(200).send({article})
    })
    .catch(next);
}
