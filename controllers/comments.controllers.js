const models = require("../models/index");

exports.postCommentToArticle = (req, res, next) => {
    const newComment = req.body;
  
    const { username, body } = newComment;
    const { article_id } = req.params;
  
    if (isNaN(article_id)) {
      return next({
        status: 400,
        msg: `400 - Bad request, invalid type: ${article_id}`,
      });
    }
  
    if (!body || body.trim().length === 0) {
      return next({
        status: 400,
        msg: `400 - Bad request, you haven't typed a comment!`,
      });
    }
  
    Promise.all([
      models.checkUserExists(username),
      models.fetchArticleById(article_id),
    ])
      .then(() => {
        const commentData = {
          body,
          author: username,
          article_id: article_id,
          votes: 0,
          created_at: new Date().toISOString(),
        };
        return models.insertCommentToArticle(commentData);
      })
      .then((comment) => {
        res.status(201).send({ comment });
      })
      .catch(next);
  };

  exports.deleteByCommentId = (req, res, next) => {
    const { comment_id } = req.params;
  
    if (isNaN(Number(comment_id))) {
      return next({
        status: 400,
        msg: "400 - Bad request, comment_id must be a number",
      });
    }
  
    const commentId = Number(comment_id);
  
    models
      .checkCommentExists(commentId)
      .then(() => {
        models.removeCommentById(commentId).then(() => {
          res.status(204).send();
        });
      })
      .catch(next);
  };
  
  exports.patchCommentVotesByCommentId = (req,res,next) =>{
    const { inc_votes } = req.body;
    const { comment_id } = req.params;
    if(!inc_votes){
      return next({
        status: 400,
        msg: `400 - Bad request, must enter inc_votes: number`
      })
    }

    if (typeof inc_votes !== "number"){
      return next({
        status: 400,
        msg: `400 - Bad request, inc_votes MUST be a number`
      });
    }

    models.changeCommentVoteAmount(comment_id, inc_votes)
    .then(()=>{
      return models.checkCommentExists(comment_id);
    })
    .then((updatedComment)=>{
      res.status(200).send({ updatedComment })
    })
    .catch(next);
  }