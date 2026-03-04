const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { auth } = require('../middleware/auth');

router.post('/generate-content', auth, aiController.generateContent);
router.get('/project-insights', auth, aiController.getProjectInsights);

module.exports = router;
