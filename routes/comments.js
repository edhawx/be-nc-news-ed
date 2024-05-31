const express = require('express');
const { deleteByCommentId, patchCommentVotesByCommentId } = require('../controllers/index');

const router = express.Router();

router.delete('/:comment_id', deleteByCommentId);
router.patch('/:comment_id', patchCommentVotesByCommentId)

module.exports = router;