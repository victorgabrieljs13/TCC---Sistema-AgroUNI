const express = require('express');
const router = express.Router();
const { listarVitrine } = require('../controllers/vitrineController');

router.get('/', listarVitrine);

module.exports = router;