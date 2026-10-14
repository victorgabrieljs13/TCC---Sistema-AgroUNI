const pool = require('../config/db');

// Listar movimentações (pode filtrar por produto)
async function listarMovimentacoes(req, res) {
    try {
        const { produto_id } = req.query;

        let query = 'SELECT * FROM movimentacoes_estoque';
        let params = [];

        if (produto_id) {
            query += ' WHERE produto_id = ?';
            params.push(produto_id);
        }

        query += ' ORDER BY data_movimentacao DESC';

        const [movimentacoes] = await pool.query(query, params);
        res.json(movimentacoes);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar movimentações.' });
    }
}

// Registrar movimentação (entrada ou saída) e atualizar estoque automaticamente
async function registrarMovimentacao(req, res) {
    const conexao = await pool.getConnection();
    try {
        const { produto_id, tipo, quantidade, motivo } = req.body;

        if (!produto_id || !tipo || !quantidade) {
            return res.status(400).json({ mensagem: 'Produto, tipo e quantidade são obrigatórios.' });
        }

        if (tipo !== 'entrada' && tipo !== 'saida') {
            return res.status(400).json({ mensagem: 'Tipo deve ser "entrada" ou "saida".' });
        }

        await conexao.beginTransaction();

        const [produtos] = await conexao.query(
            'SELECT quantidade_estoque, estoque_minimo, nome FROM produtos WHERE id = ? FOR UPDATE',
            [produto_id]
        );

        if (produtos.length === 0) {
            await conexao.rollback();
            return res.status(404).json({ mensagem: 'Produto não encontrado.' });
        }

        const estoqueAtual = parseFloat(produtos[0].quantidade_estoque);
        const qtd = parseFloat(quantidade);

        let novoEstoque;
        if (tipo === 'entrada') {
            novoEstoque = estoqueAtual + qtd;
        } else {
            novoEstoque = estoqueAtual - qtd;
            if (novoEstoque < 0) {
                await conexao.rollback();
                return res.status(400).json({ mensagem: 'Estoque insuficiente para essa saída.' });
            }
        }

        await conexao.query(
            'INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo) VALUES (?, ?, ?, ?)',
            [produto_id, tipo, qtd, motivo || null]
        );

        await conexao.query(
            'UPDATE produtos SET quantidade_estoque = ? WHERE id = ?',
            [novoEstoque, produto_id]
        );

        await conexao.commit();

        const alertaEstoqueBaixo = novoEstoque <= parseFloat(produtos[0].estoque_minimo);

        res.status(201).json({
            mensagem: 'Movimentação registrada com sucesso!',
            estoque_atual: novoEstoque,
            alerta_estoque_baixo: alertaEstoqueBaixo,
            produto: produtos[0].nome
        });
    } catch (erro) {
        await conexao.rollback();
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao registrar movimentação.' });
    } finally {
        conexao.release();
    }
}

module.exports = {
    listarMovimentacoes,
    registrarMovimentacao
};