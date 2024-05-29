const db = require("../db/connection");

exports.checkUserExists = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({
          status: 404,
          msg: "404 - Not found, user doesn't exist!",
        });
      }
    });
};

exports.checkCommentExists = (comment_id) => {
  return db
    .query("SELECT * FROM comments WHERE comment_id = $1;", [comment_id])
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
