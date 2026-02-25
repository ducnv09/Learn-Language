const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');

router.post('/', upload.array('files', 10), uploadController.upload);
router.get('/deck/:deckId', uploadController.getFilesByDeck);
router.delete('/:id', uploadController.deleteFile);

module.exports = router;
