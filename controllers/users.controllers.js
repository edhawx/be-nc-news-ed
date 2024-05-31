const models = require("../models/index");

exports.getUsers = (req, res, next) => {
  const validParams = [];
  const queryKeys = Object.keys(req.query);

  const invalidParam = queryKeys.some((key) => !validParams.includes(key));

  if (invalidParam) {
    res.status(400).send({ msg: "400 - Bad request, invalid user parameters" });
  } else {
    models
      .fetchUsers()
      .then((users) => {
        res.status(200).send({ users });
      })
      .catch((err) => {
        next(err);
      });
  }
};

const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return typeof username === "string" && usernameRegex.test(username);
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  const isValidUsername = validateUsername(username);

  if (!isValidUsername) {
    return res
      .status(400)
      .send({ msg: `400 - Bad request, this username is invalid format!` });
  }

  return Promise.all([
    models.checkUserExists(username),
    models.fetchUserByUsername(username),
  ])
    .then(([exists, user]) => {
      res.status(200).send({ user });
    })
    .catch(next);
};
