const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, userController.getAllUsers);
router.get('/:id', auth, userController.getUserById);
router.put('/:id', auth, authorize('Admin', 'Manager'), userController.updateUser);
router.delete('/:id', auth, authorize('Admin'), userController.deleteUser);

module.exports = router;
