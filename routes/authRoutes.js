const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { validateLogin, validateRegister } = require('../middleware/validation');

router.post('/login', loginLimiter, validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);
router.get('/profile', auth, authController.getProfile);

module.exports = router;
