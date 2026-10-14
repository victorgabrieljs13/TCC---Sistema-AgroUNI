const express = require('express');
const router = express.Router();
const {
    listarFeirantes,
    buscarFeirantePorId,
    cadastrarFeirante,
    atualizarFeirante,
    excluirFeirante
} = require('../controllers/feirantesController');

router.get('/', listarFeirantes);
router.get('/:id', buscarFeirantePorId);
router.post('/', cadastrarFeirante);
router.put('/:id', atualizarFeirante);
router.delete('/:id', excluirFeirante);

module.exports = router;