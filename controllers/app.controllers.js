const { fetchTopics } = require('../models/index')

exports.getTopics = (req,res,next)=>{
    const validParams = [];
    const queryKeys = Object.keys(req.query);

    const invalidParam = queryKeys.some(key=> !validParams.includes(key))

    if(invalidParam){
        res.status(400).send({msg: "400 - Bad request"})
    } else {

    fetchTopics().then((topics)=>{
        res.status(200).send({topics});
    })
    .catch((err)=>{
        next(err);
    })
}
}