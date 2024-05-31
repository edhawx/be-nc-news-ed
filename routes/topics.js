const express = require('express');
const { getTopics } = require('../controllers/index');

const router = express.Router();

router.get('/', getTopics);

module.exports = router;