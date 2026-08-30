const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve os arquivos do frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', 'FrontEnd')));

// ... suas rotas continuam aqui embaixo (feirantes, produtos, movimentacoes, auth) ...

const feirantesRoutes = require('./routes/feirantesRoutes');
app.use('/feirantes', feirantesRoutes);

const produtosRoutes = require('./routes/produtosRoutes');
app.use('/produtos', produtosRoutes);

const movimentacoesRoutes = require('./routes/movimentacoesRoutes');
app.use('/movimentacoes', movimentacoesRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const pool = require('./config/db');

app.get('/teste-db', async (req, res) => {
    try {
        const [resultado] = await pool.query('SELECT 1 + 1 AS soma');
        res.json({ status: 'Conexão com banco OK!', resultado });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ status: 'Erro na conexão', erro: erro.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});