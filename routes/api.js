const express = require('express');
const { getApi } = require('../controllers/index');

const router = express.Router();

router.get('/', getApi);

module.exports = router;