const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const { criarPedido, listarPedidosFeirante, aceitarPedido, recusarPedido } = require('../controllers/pedidosController');

router.post('/', criarPedido); // pública, o consumidor não tem login
router.get('/', verificarToken, listarPedidosFeirante);
router.put('/:id/aceitar', verificarToken, aceitarPedido);
router.put('/:id/recusar', verificarToken, recusarPedido);

module.exports = router;