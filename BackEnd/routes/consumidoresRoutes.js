const express = require('express');
const router = express.Router();
const { cadastrarConsumidor, loginConsumidor } = require('../controllers/consumidoresController');

router.post('/', cadastrarConsumidor);
router.post('/login', loginConsumidor);

module.exports = router;