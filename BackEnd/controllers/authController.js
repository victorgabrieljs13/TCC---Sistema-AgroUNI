const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function login(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
        }

        const [resultado] = await pool.query(
            'SELECT id, nome, email, senha, ativo FROM feirantes WHERE email = ?',
            [email]
        );

        if (resultado.length === 0) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
        }

        const feirante = resultado[0];

        if (!feirante.ativo) {
            return res.status(403).json({ mensagem: 'Cadastro inativo. Entre em contato com a administração.' });
        }

        const senhaCorreta = await bcrypt.compare(senha, feirante.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
        }

        const token = jwt.sign(
            { id: feirante.id, nome: feirante.nome },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            mensagem: 'Login realizado com sucesso!',
            token,
            feirante: { id: feirante.id, nome: feirante.nome, email: feirante.email }
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao realizar login.' });
    }
}

module.exports = { login };