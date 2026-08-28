const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ mensagem: 'Token não fornecido. Faça login novamente.' });
    }

    // O header vem no formato "Bearer <token>", então precisamos separar
    const partes = authHeader.split(' ');

    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(401).json({ mensagem: 'Formato de token inválido.' });
    }

    const token = partes[1];

    try {
        const dadosToken = jwt.verify(token, process.env.JWT_SECRET);
        // Guarda os dados do feirante logado pra usar depois, nas próximas funções
        req.feiranteLogado = dadosToken;
        next(); // libera a requisição pra seguir pro controller
    } catch (erro) {
        return res.status(401).json({ mensagem: 'Token inválido ou expirado. Faça login novamente.' });
    }
}

module.exports = verificarToken;