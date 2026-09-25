const pool = require('../config/db');

// Rota pública: lista tudo que está disponível pra compra, de todos os feirantes
async function listarVitrine(req, res) {
    try {
        const [produtos] = await pool.query(
            `SELECT p.id, p.nome, p.categoria, p.unidade_medida, p.preco_atual, p.quantidade_estoque,
                    f.id AS feirante_id, f.nome AS feirante_nome, f.box AS feirante_box
             FROM produtos p
             JOIN feirantes f ON f.id = p.feirante_id
             WHERE p.status = 'ativo' AND p.quantidade_estoque > 0 AND f.ativo = 1
             ORDER BY f.nome, p.nome`
        );
        res.json(produtos);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao carregar a vitrine.' });
    }
}

module.exports = { listarVitrine };