const pool = require('../config/db');

// Listar produtos (pode filtrar por feirante)
async function listarProdutos(req, res) {
    try {
        const { feirante_id } = req.query;

        let query = 'SELECT * FROM produtos';
        let params = [];

        if (feirante_id) {
            query += ' WHERE feirante_id = ?';
            params.push(feirante_id);
        }

        const [produtos] = await pool.query(query, params);
        res.json(produtos);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar produtos.' });
    }
}

// Buscar um produto específico
async function buscarProdutoPorId(req, res) {
    try {
        const { id } = req.params;
        const [resultado] = await pool.query('SELECT * FROM produtos WHERE id = ?', [id]);

        if (resultado.length === 0) {
            return res.status(404).json({ mensagem: 'Produto não encontrado.' });
        }

        res.json(resultado[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar produto.' });
    }
}

// Cadastrar produto
async function cadastrarProduto(req, res) {
    try {
        const { feirante_id, nome, categoria, unidade_medida, preco_atual, quantidade_estoque, estoque_minimo } = req.body;

        if (!feirante_id || !nome || !unidade_medida || preco_atual === undefined) {
            return res.status(400).json({ mensagem: 'Feirante, nome, unidade de medida e preço são obrigatórios.' });
        }

        const [resultado] = await pool.query(
            `INSERT INTO produtos (feirante_id, nome, categoria, unidade_medida, preco_atual, quantidade_estoque, estoque_minimo)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [feirante_id, nome, categoria, unidade_medida, preco_atual, quantidade_estoque || 0, estoque_minimo || 0]
        );

        res.status(201).json({ mensagem: 'Produto cadastrado com sucesso!', id: resultado.insertId });
    } catch (erro) {
        console.error(erro);
        if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ mensagem: 'Feirante informado não existe.' });
        }
        res.status(500).json({ mensagem: 'Erro ao cadastrar produto.' });
    }
}

// Atualizar produto (COM histórico de preço automático)
async function atualizarProduto(req, res) {
    const conexao = await pool.getConnection();
    try {
        const { id } = req.params;
        const { nome, categoria, unidade_medida, preco_atual, quantidade_estoque, estoque_minimo, status } = req.body;

        await conexao.beginTransaction();

        // 1. Busca o preço atual ANTES de atualizar, pra comparar
        const [produtoAtual] = await conexao.query('SELECT preco_atual FROM produtos WHERE id = ?', [id]);

        if (produtoAtual.length === 0) {
            await conexao.rollback();
            return res.status(404).json({ mensagem: 'Produto não encontrado.' });
        }

        const precoAnterior = parseFloat(produtoAtual[0].preco_atual);
        const precoNovo = parseFloat(preco_atual);

        // 2. Atualiza o produto
        await conexao.query(
            `UPDATE produtos SET nome = ?, categoria = ?, unidade_medida = ?, preco_atual = ?, 
             quantidade_estoque = ?, estoque_minimo = ?, status = ? WHERE id = ?`,
            [nome, categoria, unidade_medida, precoNovo, quantidade_estoque, estoque_minimo, status, id]
        );

        // 3. Se o preço mudou, registra no histórico
        if (precoAnterior !== precoNovo) {
            await conexao.query(
                'INSERT INTO historico_precos (produto_id, preco_anterior, preco_novo) VALUES (?, ?, ?)',
                [id, precoAnterior, precoNovo]
            );
        }

        await conexao.commit();
        res.json({ mensagem: 'Produto atualizado com sucesso!' });
    } catch (erro) {
        await conexao.rollback();
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao atualizar produto.' });
    } finally {
        conexao.release();
    }
}

// Excluir produto
async function excluirProduto(req, res) {
    try {
        const { id } = req.params;
        const [resultado] = await pool.query('DELETE FROM produtos WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Produto não encontrado.' });
        }

        res.json({ mensagem: 'Produto excluído com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao excluir produto.' });
    }
}

module.exports = {
    listarProdutos,
    buscarProdutoPorId,
    cadastrarProduto,
    atualizarProduto,
    excluirProduto
};