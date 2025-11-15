const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/lostFoundController');

router.get('/', ctrl.getItems);
router.get('/:id', ctrl.getItemById);
router.post('/', ctrl.createReport);
router.patch('/:id/status', ctrl.updateItemStatus);

module.exports = router;
