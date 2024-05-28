const express = require("express");
const app = express();
const pool = require("./db/connection");
const { getTopics } = require("./controllers/index");
const e = require("express");

app.get("/api/topics", getTopics);

app.use((err, req, res, next)=>{
    if(err.status === 400){
        res.status(400).send({msg: "400 - Bad request"})
    } else if ( err.code === "22P02" || err.code==="23502" ){
        res.status(400).send({ msg: "400 - Bad request "})
    } else {
        next(err);
    }
})

app.use((req, res, next)=>{
    res.status(404).send({msg: "404 - Not found"});
});

module.exports = app;