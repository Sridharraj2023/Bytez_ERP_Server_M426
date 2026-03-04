const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, clientController.getAllClients);
router.get('/:id', auth, clientController.getClientById);
router.post('/', auth, authorize('Admin', 'Manager'), clientController.createClient);
router.put('/:id', auth, authorize('Admin', 'Manager'), clientController.updateClient);
router.delete('/:id', auth, authorize('Admin'), clientController.deleteClient);

module.exports = router;
