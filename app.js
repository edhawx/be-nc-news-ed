const express = require("express");
const app = express();
const topicsRouter = require("./routes/topics");
const articlesRouter = require("./routes/articles");
const commentsRouter = require("./routes/comments");
const usersRouter = require("./routes/users");
const apiRouter = require("./routes/api");

app.use(express.json());

app.use("/api/topics", topicsRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/users", usersRouter);
app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22P02" || err.code === "23502") {
    res.status(400).send({ msg: "400 - Bad request" });
  } 
});

app.use((req, res, next) => {
  res.status(404).send({ msg: "404 - Not found" });
});

app.use((req,res,next)=>{
  res.status(500).send({ msg: "500 - Internal Server Error" })
})

module.exports = app;