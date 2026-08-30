const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const {
    listarProdutos,
    buscarProdutoPorId,
    cadastrarProduto,
    atualizarProduto,
    excluirProduto,
    historicoPrecoProduto
} = require('../controllers/produtosController');

router.get('/', verificarToken, listarProdutos);
router.get('/:id/historico', verificarToken, historicoPrecoProduto);
router.get('/:id', verificarToken, buscarProdutoPorId);
router.post('/', verificarToken, cadastrarProduto);
router.put('/:id', verificarToken, atualizarProduto);
router.delete('/:id', verificarToken, excluirProduto);

module.exports = router;