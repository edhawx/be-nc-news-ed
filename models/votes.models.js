const express = require("express");
const db = require("../db/connection");
const articles = require("../db/data/test-data/articles");

exports.changeVoteAmount = (article_id, inc_votes) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.changeCommentVoteAmount = (comment_id, inc_votes) => {
  return db
    .query(
      `UPDATE comments SET votes = votes + $1
  WHERE comment_id = $2
  RETURNING *;`,
      [inc_votes, comment_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

