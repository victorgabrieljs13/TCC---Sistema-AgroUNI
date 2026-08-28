const express = require('express');
const router = express.Router();
const { listarMovimentacoes, registrarMovimentacao } = require('../controllers/movimentacoesController');

router.get('/', listarMovimentacoes);
router.post('/', registrarMovimentacao);

module.exports = router;