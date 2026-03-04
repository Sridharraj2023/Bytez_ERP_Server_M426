const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

router.get('/', auth, taskController.getAllTasks);
router.get('/:id', auth, taskController.getTaskById);
router.post('/', auth, taskController.createTask);
router.put('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);
router.post('/:id/comments', auth, taskController.addComment);

module.exports = router;
