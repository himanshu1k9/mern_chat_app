const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/fileUpload');


router.post('/send', auth, messageController.sendTextMessage);
router.post('/send-file', auth, upload.single('file'), messageController.sendFileMessage);

module.exports = router;