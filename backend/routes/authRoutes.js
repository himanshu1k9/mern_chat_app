const express = require('express');
const router = express.Router();
const authCOntroller = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');


router.post('/register', authCOntroller.registerUser);
router.post('/login', authCOntroller.loginUser);
// router.get('/me', verifyToken, authCOntroller.getMe);


module.exports = router;