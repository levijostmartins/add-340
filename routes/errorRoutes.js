const express = require('express');
const router = express.Router();
const errorController = require('../controllers/errorController');

router.get('/cause-error', errorController.triggerServerError);

module.exports = router;
