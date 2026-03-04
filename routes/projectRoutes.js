const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, projectController.getAllProjects);
router.get('/:id', auth, projectController.getProjectById);
router.post('/', auth, authorize('Admin', 'Manager'), projectController.createProject);
router.put('/:id', auth, authorize('Admin', 'Manager'), projectController.updateProject);
router.delete('/:id', auth, authorize('Admin'), projectController.deleteProject);
router.post('/:id/members', auth, authorize('Admin', 'Manager'), projectController.assignMember);

module.exports = router;
