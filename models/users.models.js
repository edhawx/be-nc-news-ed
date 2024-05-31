const db = require("../db/connection");

exports.fetchUsers = () => {
    return db
      .query(`SELECT * FROM users;`)
      .then((res) => {
        return res.rows;
      })
      .catch((err) => {
        next(err);
      });
  };

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
  
  