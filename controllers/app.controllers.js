const { fetchTopics } = require('../models/index')

exports.getTopics = (req,res,next)=>{
    fetchTopics().then((topics)=>{
        res.status(200).send({topics});
    })
}