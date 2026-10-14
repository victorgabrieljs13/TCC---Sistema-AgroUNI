const express = require('express');
const router = express.Router();
const verificarTokenConsumidor = require('../middlewares/consumidorMiddleware');
const verificarToken = require('../middlewares/authMiddleware');
const { criarPedido, listarPedidosFeirante, aceitarPedido, recusarPedido, listarPedidosConsumidor } = require('../controllers/pedidosController');

router.post('/', criarPedido); // pública, o consumidor não tem login
router.get('/', verificarToken, listarPedidosFeirante);
router.put('/:id/aceitar', verificarToken, aceitarPedido);
router.put('/:id/recusar', verificarToken, recusarPedido);
router.get('/meus', verificarTokenConsumidor, listarPedidosConsumidor);



module.exports = router;