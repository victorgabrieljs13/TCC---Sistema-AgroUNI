const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function cadastrarConsumidor(req, res) {
    try {
        const { nome, email, senha, telefone } = req.body;

        if (!nome || !email || !senha || !telefone) {
            return res.status(400).json({ mensagem: 'Nome, email, senha e telefone são obrigatórios.' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const [resultado] = await pool.query(
            'INSERT INTO consumidores (nome, email, senha, telefone) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, telefone]
        );

        res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!', id: resultado.insertId });
    } catch (erro) {
        console.error(erro);
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensagem: 'Esse email já está cadastrado.' });
        }
        res.status(500).json({ mensagem: 'Erro ao cadastrar.' });
    }
}

async function loginConsumidor(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
        }

        const [resultado] = await pool.query(
            'SELECT id, nome, email, senha, telefone FROM consumidores WHERE email = ?',
            [email]
        );

        if (resultado.length === 0) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
        }

        const consumidor = resultado[0];
        const senhaCorreta = await bcrypt.compare(senha, consumidor.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
        }

        const token = jwt.sign(
            { id: consumidor.id, nome: consumidor.nome, tipo: 'consumidor' },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            mensagem: 'Login realizado com sucesso!',
            token,
            consumidor: { id: consumidor.id, nome: consumidor.nome, email: consumidor.email, telefone: consumidor.telefone }
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao realizar login.' });
    }
}

module.exports = { cadastrarConsumidor, loginConsumidor };