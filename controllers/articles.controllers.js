const models = require("../models/index");

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params;
    models
      .fetchArticleById(article_id)
      .then((article) => {
        res.status(200).send({ article });
      })
      .catch(next);
  };
  
  exports.getArticles = (req, res, next) => {
    const { sort_by, order, topic } = req.query;
    const validParams = ["sort_by", "order", "topic"];
    const queryKeys = Object.keys(req.query);
    const invalidParams = queryKeys.some((key) => !validParams.includes(key));
  
    if (invalidParams) {
      return next({ status: 400, msg: "400 - Bad request, invalid parameters" });
    }
  
    models
      .fetchArticles(sort_by, order, topic)
      .then((articles) => {
        res.status(200).send({ articles });
      })
      .catch(next);
  };
  
  exports.getArticleComments = (req, res, next) => {
    const { article_id } = req.params;
    models
      .fetchArticleCommentsById(article_id)
      .then((comments) => {
        res.status(200).send({ comments });
      })
      .catch((err) => {
        next(err);
      });
  };

  exports.updateVotesInArticle = (req, res, next) => {
    const { inc_votes } = req.body;
    const { article_id } = req.params;
  
    if (!inc_votes) {
      return next({
        status: 400,
        msg: `400 - Bad request, must enter inc_votes: Number`,
      });
    }
  
    if (typeof inc_votes !== "number") {
      return next({
        status: 400,
        msg: `400 - Bad request, inc_votes MUST be number`,
      });
    }
  
    models
      .changeVoteAmount(article_id, inc_votes)
      .then(() => {
        return models.fetchArticleById(article_id);
      })
      .then((updatedArticle) => {
        res.status(200).send({ article: updatedArticle });
      })
      .catch(next);
  };
  