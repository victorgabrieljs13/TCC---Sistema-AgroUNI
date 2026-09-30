# AgroUNI - Sistema de Gestão de Estoque para Feirantes

Sistema web para digitalizar o controle de estoque dos feirantes da central de 
abastecimento, permitindo que cada vendedor gerencie seus produtos, acompanhe 
preços, registre entradas e saídas, e seja alertado quando o estoque estiver baixo.

🔗 **Acesse o sistema:** https://agrouni-backend.onrender.com

## Objetivo

Substituir o controle manual/informal de estoque feito pelos feirantes por um 
sistema digital simples, permitindo rastreabilidade de produtos, preços e 
movimentações — reduzindo perdas por falta de reposição e dando visibilidade 
sobre o negócio.

## Tecnologias utilizadas

**Back-end**
- Node.js + Express
- MySQL (hospedado na Aiven)
- JWT (autenticação)
- bcrypt (criptografia de senha)

**Front-end**
- HTML5, CSS3, JavaScript (Fetch API)
- Chart.js (gráficos do dashboard)

**Infraestrutura**
- Banco de dados: Aiven (MySQL gerenciado)
- Hospedagem: Render

## Como instalar e executar localmente

### Pré-requisitos
- Node.js instalado (v18 ou superior)
- Uma instância MySQL (local ou remota)

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
cd SEU-REPOSITORIO/BackEnd
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na pasta `BackEnd`, seguindo o modelo de `.env.example`, com suas credenciais de banco:

DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=


4. Execute o script `DataBase/schema.sql` no seu banco MySQL para criar as tabelas.

5. Inicie o servidor:
```bash
npm run dev
```

6. Acesse `http://localhost:3000` no navegador.

## Estrutura do projeto

Projeto/
├── BackEnd/ → API REST (Node.js + Express)
│ ├── config/ → conexão com banco de dados
│ ├── controllers/ → lógica de negócio
│ ├── middlewares/ → autenticação JWT
│ └── routes/ → rotas da API
├── FrontEnd/ → interface web (HTML/CSS/JS)
├── DataBase/ → scripts SQL (estrutura das tabelas)
├── Docs/ → documentação técnica completa
└── README.md


## Funcionalidades principais

- Cadastro e login de feirantes (autenticação JWT)
- CRUD completo de produtos (cadastrar, listar, editar, excluir)
- Controle de preço com histórico automático de alterações
- Registro de movimentação de estoque (entrada/saída) com atualização automática de quantidade
- Alerta visual de estoque abaixo do mínimo
- Dashboard com gráficos de estoque e variação de preço

## Integrantes

- [Nome completo do integrante 1]
- [Nome completo do integrante 2]
- [Nome completo do integrante 3]
- [Nome completo do integrante 4]

## Instituição

SENAI Candeias

## Professor Orientador

Adalberto Santana