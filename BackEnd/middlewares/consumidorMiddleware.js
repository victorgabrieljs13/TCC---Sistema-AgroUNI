const jwt = require('jsonwebtoken');

function verificarTokenConsumidor(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ mensagem: 'Token não fornecido. Faça login novamente.' });
    }

    const partes = authHeader.split(' ');
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(401).json({ mensagem: 'Formato de token inválido.' });
    }

    try {
        const dadosToken = jwt.verify(partes[1], process.env.JWT_SECRET);

        if (dadosToken.tipo !== 'consumidor') {
            return res.status(403).json({ mensagem: 'Esse token não é de um consumidor.' });
        }

        req.consumidorLogado = dadosToken;
        next();
    } catch (erro) {
        return res.status(401).json({ mensagem: 'Token inválido ou expirado. Faça login novamente.' });
    }
}

module.exports = verificarTokenConsumidor;