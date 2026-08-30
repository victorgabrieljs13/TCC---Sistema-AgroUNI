protegerPagina();

const feirante = getFeiranteLogado();
document.getElementById('nome-feirante').textContent = `Olá, ${feirante.nome}`;
document.getElementById('btn-logout').addEventListener('click', fazerLogout);

const selectProduto = document.getElementById('produto_id');
const formMovimentacao = document.getElementById('form-movimentacao');
const mensagemErro = document.getElementById('mensagem-erro');
const mensagemSucesso = document.getElementById('mensagem-sucesso');

// Carrega a lista de produtos do feirante pra preencher o <select>
async function carregarProdutosNoSelect() {
    try {
        const resposta = await fetch(`${API_URL}/produtos`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        const produtos = await resposta.json();

        produtos.forEach(produto => {
            const opcao = document.createElement('option');
            opcao.value = produto.id;
            opcao.textContent = `${produto.nome} (estoque atual: ${produto.quantidade_estoque} ${produto.unidade_medida})`;
            selectProduto.appendChild(opcao);
        });

    } catch (erro) {
        console.error(erro);
        mensagemErro.textContent = 'Erro ao carregar produtos.';
        mensagemErro.style.display = 'block';
    }
}

formMovimentacao.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    mensagemErro.style.display = 'none';
    mensagemSucesso.style.display = 'none';

    const dadosMovimentacao = {
        produto_id: selectProduto.value,
        tipo: document.getElementById('tipo').value,
        quantidade: parseFloat(document.getElementById('quantidade').value),
        motivo: document.getElementById('motivo').value
    };

    try {
        const resposta = await fetch(`${API_URL}/movimentacoes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(dadosMovimentacao)
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mensagemErro.textContent = dados.mensagem;
            mensagemErro.style.display = 'block';
            return;
        }

        let textoSucesso = dados.mensagem;
        if (dados.alerta_estoque_baixo) {
            textoSucesso += ' ⚠️ Atenção: estoque abaixo do mínimo!';
        }

        mensagemSucesso.textContent = textoSucesso;
        mensagemSucesso.style.display = 'block';

        formMovimentacao.reset();

        setTimeout(() => {
            window.location.href = 'produtos.html';
        }, 1500);

    } catch (erro) {
        console.error(erro);
        mensagemErro.textContent = 'Erro ao registrar movimentação. Verifique se o back-end está rodando.';
        mensagemErro.style.display = 'block';
    }
});

carregarProdutosNoSelect();