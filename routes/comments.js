const express = require('express');
const { deleteByCommentId } = require('../controllers/index');

const router = express.Router();

router.delete('/:comment_id', deleteByCommentId);

module.exports = router;