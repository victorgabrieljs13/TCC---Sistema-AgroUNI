USE agrouni_db;

CREATE TABLE IF NOT EXISTS tokens_recuperacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_tipo ENUM('feirante', 'consumidor') NOT NULL,
    usuario_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expira_em DATETIME NOT NULL,
    usado_em DATETIME NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tokens_usuario (usuario_tipo, usuario_id),
    INDEX idx_tokens_expiracao (expira_em)
);