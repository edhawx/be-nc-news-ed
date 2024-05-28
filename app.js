const express = require("express");
const app = express();
const pool = require("./db/connection");
const { getTopics } = require("./controllers/index")

app.get("/api/topics", getTopics);

app.use((req, res, next)=>{
    res.status(404).send({msg: "404 - Not found"});
});

module.exports = app;