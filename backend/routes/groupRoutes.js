const express = require('express');
const router = express.Router();
const groupChatController = require('../controllers/groupChatController');
const auth = require('../middlewares/authMiddleware');

router.post('/create', auth, groupChatController.createGroupChat);
router.put('/rename', auth, groupChatController.renameGroup);
router.put('/add-user', auth, groupChatController.addToGroup);
router.put('/remove-user', auth, groupChatController.removeFromGroup);

module.exports = router;
