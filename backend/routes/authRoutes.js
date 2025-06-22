const express = require('express');
const router = express.Router();
const authCOntroller = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');


router.post('/register', upload.single('avtar'),  authCOntroller.registerUser);
router.post('/login', authCOntroller.loginUser);
// router.get('/me', verifyToken, authCOntroller.getMe);
router.get('/logout', authCOntroller.logoutUser);


module.exports = router;