const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const friendController = require('../controllers/friendController');

router.post('/send-request', auth, friendController.sendFriendRequest);
router.post('/accept-request', auth, friendController.acceptFriendRequest);
router.post('/decline-request', auth, friendController.declineFriendRequest);

module.exports = router;