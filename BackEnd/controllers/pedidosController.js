const pool = require('../config/db');

// Público: o consumidor cria a reserva
async function criarPedido(req, res) {
    const conexao = await pool.getConnection();
    try {
        const { feirante_id, nome_cliente, telefone_cliente, itens } = req.body;

        if (!feirante_id || !nome_cliente || !telefone_cliente || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ mensagem: 'Feirante, nome, telefone e ao menos um item são obrigatórios.' });
        }

        await conexao.beginTransaction();

        const [feirantes] = await conexao.query('SELECT id FROM feirantes WHERE id = ? AND ativo = 1', [feirante_id]);
        if (feirantes.length === 0) {
            await conexao.rollback();
            return res.status(404).json({ mensagem: 'Feirante não encontrado.' });
        }

        const [resultadoPedido] = await conexao.query(
            'INSERT INTO pedidos (feirante_id, nome_cliente, telefone_cliente) VALUES (?, ?, ?)',
            [feirante_id, nome_cliente, telefone_cliente]
        );
        const pedidoId = resultadoPedido.insertId;

        for (const item of itens) {
            const [produtos] = await conexao.query(
                "SELECT id, preco_atual FROM produtos WHERE id = ? AND feirante_id = ? AND status = 'ativo'",
                [item.produto_id, feirante_id]
            );

            if (produtos.length === 0) {
                await conexao.rollback();
                return res.status(400).json({ mensagem: `Um dos produtos não está mais disponível.` });
            }

            const quantidade = parseFloat(item.quantidade);
            if (!quantidade || quantidade <= 0) {
                await conexao.rollback();
                return res.status(400).json({ mensagem: 'Quantidade inválida em um dos itens.' });
            }

            // Trava o preço de agora — não referencia o preco_atual do produto no futuro
            await conexao.query(
                'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
                [pedidoId, item.produto_id, quantidade, produtos[0].preco_atual]
            );
        }

        await conexao.commit();
        res.status(201).json({ mensagem: 'Pedido enviado! O feirante vai confirmar em breve.', id: pedidoId });

    } catch (erro) {
        await conexao.rollback();
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao registrar pedido.' });
    } finally {
        conexao.release();
    }
}

// Feirante logado: lista os pedidos recebidos, com os itens de cada um
async function listarPedidosFeirante(req, res) {
    try {
        const feirante_id = req.feiranteLogado.id;

        const [pedidos] = await pool.query(
            'SELECT id, nome_cliente, telefone_cliente, status, data_pedido FROM pedidos WHERE feirante_id = ? ORDER BY data_pedido DESC',
            [feirante_id]
        );

        if (pedidos.length === 0) return res.json([]);

        const idsPedidos = pedidos.map(p => p.id);
        const [itens] = await pool.query(
            `SELECT ip.pedido_id, ip.quantidade, ip.preco_unitario, p.nome AS produto_nome, p.unidade_medida
             FROM itens_pedido ip
             JOIN produtos p ON p.id = ip.produto_id
             WHERE ip.pedido_id IN (?)`,
            [idsPedidos]
        );

        const pedidosComItens = pedidos.map(pedido => ({
            ...pedido,
            itens: itens.filter(item => item.pedido_id === pedido.id)
        }));

        res.json(pedidosComItens);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar pedidos.' });
    }
}

// Feirante aceita: só agora o estoque é debitado, dentro de uma transação
async function aceitarPedido(req, res) {
    const conexao = await pool.getConnection();
    try {
        const { id } = req.params;
        const feirante_id = req.feiranteLogado.id;

        await conexao.beginTransaction();

        const [pedidos] = await conexao.query('SELECT * FROM pedidos WHERE id = ? FOR UPDATE', [id]);
        if (pedidos.length === 0) {
            await conexao.rollback();
            return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
        }
        if (pedidos[0].feirante_id !== feirante_id) {
            await conexao.rollback();
            return res.status(403).json({ mensagem: 'Você não tem permissão sobre esse pedido.' });
        }
        if (pedidos[0].status !== 'pendente') {
            await conexao.rollback();
            return res.status(400).json({ mensagem: 'Esse pedido já foi respondido.' });
        }

        const [itens] = await conexao.query(
            `SELECT ip.produto_id, ip.quantidade, pr.nome, pr.quantidade_estoque
             FROM itens_pedido ip
             JOIN produtos pr ON pr.id = ip.produto_id
             WHERE ip.pedido_id = ? FOR UPDATE`,
            [id]
        );

        const semEstoque = itens.filter(item => parseFloat(item.quantidade_estoque) < parseFloat(item.quantidade));
        if (semEstoque.length > 0) {
            await conexao.rollback();
            return res.status(400).json({
                mensagem: 'Estoque insuficiente para aceitar esse pedido.',
                produtos: semEstoque.map(i => i.nome)
            });
        }

        for (const item of itens) {
            const novoEstoque = parseFloat(item.quantidade_estoque) - parseFloat(item.quantidade);

            await conexao.query('UPDATE produtos SET quantidade_estoque = ? WHERE id = ?', [novoEstoque, item.produto_id]);

            await conexao.query(
                "INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo) VALUES (?, 'saida', ?, ?)",
                [item.produto_id, item.quantidade, `Pedido #${id} aceito`]
            );
        }

        await conexao.query("UPDATE pedidos SET status = 'aceito' WHERE id = ?", [id]);

        await conexao.commit();
        res.json({ mensagem: 'Pedido aceito e estoque atualizado.' });

    } catch (erro) {
        await conexao.rollback();
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao aceitar pedido.' });
    } finally {
        conexao.release();
    }
}

async function recusarPedido(req, res) {
    try {
        const { id } = req.params;
        const feirante_id = req.feiranteLogado.id;

        const [pedidos] = await pool.query('SELECT feirante_id, status FROM pedidos WHERE id = ?', [id]);
        if (pedidos.length === 0) return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
        if (pedidos[0].feirante_id !== feirante_id) return res.status(403).json({ mensagem: 'Você não tem permissão sobre esse pedido.' });
        if (pedidos[0].status !== 'pendente') return res.status(400).json({ mensagem: 'Esse pedido já foi respondido.' });

        await pool.query("UPDATE pedidos SET status = 'recusado' WHERE id = ?", [id]);
        res.json({ mensagem: 'Pedido recusado.' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao recusar pedido.' });
    }
}

module.exports = { criarPedido, listarPedidosFeirante, aceitarPedido, recusarPedido };