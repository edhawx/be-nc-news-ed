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
  