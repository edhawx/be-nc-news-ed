const db = require("../db/connection");

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `SELECT 
          articles.*, 
          COUNT(comments.comment_id)::int AS comment_count 
        FROM articles 
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
};

exports.fetchArticles = (sort_by = "created_at", order = "DESC", topic, limit, p) => {
  const validSortColumns = [
    "created_at",
    "votes",
    "comment_count",
    "title",
    "topic",
    "author",
    "body",
  ];
  const validSortOrders = ["ASC", "DESC"];
  const queryValues = [];
  let filterClauses = [];

  if (!validSortColumns.includes(sort_by) || !validSortOrders.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad request, invalid sort_by and/or order",
    });
  }

  let sqlQuery = `SELECT 
          articles.title, 
          articles.topic, 
          articles.author, 
          articles.created_at, 
          articles.article_img_url, 
          articles.votes, 
          articles.article_id,
          articles.body,
          COUNT(comments.comment_id)::int AS comment_count
      FROM articles
      LEFT JOIN comments ON articles.article_id = comments.article_id`;

  if (topic) {
    filterClauses.push(`articles.topic = $1`);
    queryValues.push(topic);
  }

  if (filterClauses.length > 0) {
    sqlQuery += ` WHERE ${filterClauses.join(" AND ")}`;
  }

  sqlQuery += ` GROUP BY articles.article_id`;
  sqlQuery += ` ORDER BY ${sort_by} ${order}`;

  if (limit && p) {
    if (isNaN(limit) || isNaN(p)) {
      return Promise.reject({
        status: 400,
        msg: "400 - Bad request, limit and page must be numbers",
      });
    }
    const offset = (p - 1) * limit;
    sqlQuery += ` LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`;
    queryValues.push(limit, offset);
  }

  const countQuery = `
    SELECT COUNT(*)::int AS total_count 
    FROM articles
    ${topic ? `WHERE articles.topic = $1` : ""}
  `;

  return Promise.all([
    db.query(sqlQuery, queryValues),
    db.query(countQuery, topic ? [topic] : []),
  ]).then(([articlesResult, countResult]) => {
    return {
      articles: articlesResult.rows,
      total_count: countResult.rows[0].total_count,
    };
  });
};
exports.fetchArticleCommentsById = (article_id) => {
  return db
    .query(
      `SELECT
      comments.*,
      articles.article_id
      FROM comments
      LEFT JOIN articles ON comments.article_id = articles.article_id
      WHERE articles.article_id = $1
      ORDER BY created_at DESC;`,
      [article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `404 - No comments found for article ID of ${article_id}`,
        });
      }
      return result.rows;
    });
};

exports.insertNewArticle = (articleData) => {
  const { author, title, body, votes, topic, article_img_url, created_at } = articleData;
  const sqlQuery = `
    INSERT INTO articles (author, title, body, votes, topic, article_img_url, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const queryValues = [author, title, body, votes, topic, article_img_url, created_at];

  return db.query(sqlQuery, queryValues).then((result) => result.rows[0]);
};