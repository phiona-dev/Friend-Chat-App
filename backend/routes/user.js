const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');

router.post('/', ctrl.createOrUpdateUser);
router.get('/:userId', ctrl.getUserProfile);

module.exports = router;