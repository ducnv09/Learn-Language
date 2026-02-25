const express = require('express');
const router = express.Router();
const processController = require('../controllers/processController');

router.post('/', processController.processFiles);

module.exports = router;
