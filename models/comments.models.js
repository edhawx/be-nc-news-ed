const db = require("../db/connection");

exports.insertCommentToArticle = ({
    body,
    author,
    article_id,
    votes,
    created_at,
  }) => {
    return db
      .query(
        `INSERT INTO comments (body, author, article_id, votes, created_at)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [body, author, article_id, votes, created_at]
      )
      .then(({ rows }) => {
        return rows[0];
      });
  };

  exports.removeCommentById = (comment_id) => {
    return db
      .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *;", [
        comment_id,
      ])
      .then((result) => {
        if (result.rows.length === 0) {
          return Promise.reject({
            status: 404,
            msg: `404 - Not found, comment with ID ${comment_id} does not exist`,
          });
        }
        return result.rows[0];
      });
  };

  exports.checkCommentExists = (comment_id) => {
    return db
      .query(`SELECT * FROM comments WHERE comment_id = $1;`, [comment_id])
      .then((result) => {
        if (result.rows.length === 0) {
          return Promise.reject({
            status: 404,
            msg: "404 - Not found, that comment doesn't exist",
          });
        }
        return result.rows[0];
      });
  };
  