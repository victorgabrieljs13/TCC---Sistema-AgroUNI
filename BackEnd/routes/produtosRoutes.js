const express = require('express');
const router = express.Router();
const {
    listarProdutos,
    buscarProdutoPorId,
    cadastrarProduto,
    atualizarProduto,
    excluirProduto
} = require('../controllers/produtosController');

router.get('/', listarProdutos);
router.get('/:id', buscarProdutoPorId);
router.post('/', cadastrarProduto);
router.put('/:id', atualizarProduto);
router.delete('/:id', excluirProduto);

module.exports = router;