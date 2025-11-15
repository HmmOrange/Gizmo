const express = require('express');
const router = express.Router();
const pasteController = require('../controllers/textPasteController');

router.post('/', pasteController.createPaste);
router.get('/', pasteController.getAllPastes);
router.get('/:id', pasteController.getPasteById);

module.exports = router;