const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const feirantesRoutes = require('./routes/feirantesRoutes');
app.use('/feirantes', feirantesRoutes);

app.get('/', (req, res) => {
    res.json({ mensagem: 'API do sistema de feirantes rodando!' });
});

const produtosRoutes = require('./routes/produtosRoutes');
app.use('/produtos', produtosRoutes);

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