const path = require("path");
const fs = require("fs");

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