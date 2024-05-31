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
    return db.query('SELECT * FROM users WHERE username = $1', [username])
      .then((result) => {
        if (result.rows.length === 0) {
          return Promise.reject({
            status: 404,
            msg: `404 - Not found, username: "${username}" doesn't exist!`,
          });
        }
        return true;
      });
  };
  
  exports.fetchUserByUsername = (username) => {
    return db.query(`
      SELECT * FROM users
      WHERE username = $1;`,
    [username])
    .then(({ rows }) => {
      return rows[0];
    });
  };
  
  