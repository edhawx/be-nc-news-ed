const express = require("express");
const db = require("../db/connection");

exports.fetchTopics = () => {
  return db
    .query("SELECT * FROM topics")
    .then((res) => {
      return res.rows;
    })
    .catch((err) => {
      next(err);
    });
};

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `SELECT articles.*, comments.article_id FROM articles 
        LEFT JOIN comments ON articles.article_id = comments.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id, comments.article_id;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (!rows[0]) {
        return Promise.reject({
          status: 404,
          msg: `404 - No article found for article_id ${article_id}`,
        });
      }
      return rows[0];
    });
};

exports.fetchArticles = (sort_by = "created_at", order = "DESC") => {
  const validSortColumns = [
    "created_at",
    "votes",
    "comment_count",
    "title",
    "topic",
    "author",
  ];
  const validSortOrders = ["ASC", "DESC"];
  const queryValues = [];
  let filterClauses = [];

  if (!validSortColumns.includes(sort_by) || !validSortOrders.includes(order)) {
    return Promise.reject({ status: 400, msg: "400 - Bad request" });
  }

  const sqlQuery = `SELECT 
        articles.title, 
        articles.topic, 
        articles.author, 
        articles.created_at, 
        articles.article_img_url, 
        articles.votes, 
        articles.article_id,
        COUNT(comments.comment_id)::int AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order};`;

  return db.query(sqlQuery).then((result) => {
    return result.rows;
  })
};
