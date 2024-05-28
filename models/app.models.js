const express = require("express");
const db = require("../db/connection");

exports.fetchTopics = ()=>{
    return db.query("SELECT * FROM topics")
    .then((res)=>{
        return res.rows;
    })
    .catch((err)=>{
        next(err);
    })
};

exports.fetchArticleById = (article_id) => {
    return db
    .query(
        `SELECT articles.*, comments.article_id FROM articles 
        LEFT JOIN comments ON articles.article_id = comments.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id, comments.article_id;`,
        [article_id]
    )
    .then(({ rows }) => {
        if (!rows[0]) {
            return Promise.reject({
                status: 404,
                msg: `404 - No article found for article_id ${article_id}`,
            });
        }
        return rows[0];
    });
}