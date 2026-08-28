const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Listar todos os feirantes
async function listarFeirantes(req, res) {
    try {
        const [feirantes] = await pool.query(
            'SELECT id, nome, cpf_cnpj, telefone, email, box, ativo, data_cadastro FROM feirantes'
        );
        res.json(feirantes);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar feirantes.' });
    }
}

// Buscar um feirante específico pelo id
async function buscarFeirantePorId(req, res) {
    try {
        const { id } = req.params;
        const [resultado] = await pool.query(
            'SELECT id, nome, cpf_cnpj, telefone, email, box, ativo, data_cadastro FROM feirantes WHERE id = ?',
            [id]
        );

        if (resultado.length === 0) {
            return res.status(404).json({ mensagem: 'Feirante não encontrado.' });
        }

        res.json(resultado[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar feirante.' });
    }
}

// Cadastrar novo feirante
async function cadastrarFeirante(req, res) {
    try {
        const { nome, cpf_cnpj, telefone, email, senha, box } = req.body;

        if (!nome || !cpf_cnpj || !email || !senha) {
            return res.status(400).json({ mensagem: 'Nome, CPF/CNPJ, email e senha são obrigatórios.' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const [resultado] = await pool.query(
            'INSERT INTO feirantes (nome, cpf_cnpj, telefone, email, senha, box) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, cpf_cnpj, telefone, email, senhaHash, box]
        );

        res.status(201).json({ mensagem: 'Feirante cadastrado com sucesso!', id: resultado.insertId });
    } catch (erro) {
        console.error(erro);
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensagem: 'Email ou CPF/CNPJ já cadastrado.' });
        }
        res.status(500).json({ mensagem: 'Erro ao cadastrar feirante.' });
    }
}

// Atualizar feirante
async function atualizarFeirante(req, res) {
    try {
        const { id } = req.params;
        const { nome, telefone, box, ativo } = req.body;

        const [resultado] = await pool.query(
            'UPDATE feirantes SET nome = ?, telefone = ?, box = ?, ativo = ? WHERE id = ?',
            [nome, telefone, box, ativo, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Feirante não encontrado.' });
        }

        res.json({ mensagem: 'Feirante atualizado com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao atualizar feirante.' });
    }
}

// Excluir feirante
async function excluirFeirante(req, res) {
    try {
        const { id } = req.params;

        const [resultado] = await pool.query('DELETE FROM feirantes WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Feirante não encontrado.' });
        }

        res.json({ mensagem: 'Feirante excluído com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao excluir feirante.' });
    }
}

module.exports = {
    listarFeirantes,
    buscarFeirantePorId,
    cadastrarFeirante,
    atualizarFeirante,
    excluirFeirante
};