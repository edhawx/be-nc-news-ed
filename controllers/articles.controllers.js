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
  const { sort_by, order, topic, limit, p, ...invalidParams } = req.query;

  const validParams = ['sort_by', 'order', 'topic', 'limit', 'p'];
  const queryParams = Object.keys(req.query);
  const invalidParamKeys = queryParams.filter(param=>!validParams.includes(param))

  if(invalidParamKeys.length > 0){
    return next({
      status:400,
      msg: "400 - Bad request, invalid parameters"
    })
  }

  models.fetchArticles(sort_by, order, topic, parseInt(limit), parseInt(p))
    .then(({ articles, total_count }) => {
      res.status(200).send({ articles, total_count });
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

exports.postNewArticle = (req, res, next) => {
  const { author, title, body, topic, 
    article_img_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/SmileyFace.png/220px-SmileyFace.png"  
  } = req.body;

  const requiredFields = [
    {field: body, message: "400 - Bad request, you haven't typed an article!"},
    {field: author, message: "400 - Bad request, you haven't entered an author!"},
    {field: title, message: "400 - Bad request, you haven't entered a title!"},
    {field: topic, message: "400 - Bad request, you haven't entered a topic!"},
  ]

  for(const{field, message} of requiredFields){
    if(!field || field.trim().length === 0){
      return next({status: 400, msg: message})
    }
  }

  models
    .checkUserExists(author)
    .then(() => {
      const articleData = {
        author,
        title,
        body,
        votes: 0,
        topic,
        article_img_url,
        created_at: new Date().toISOString(),
      };
      return models.insertNewArticle(articleData);
    })
    .then((articleData) => {
      const article = { ...articleData, comment_count: 0 };
      res.status(201).send({ article });
    })
    .catch(next);
};
