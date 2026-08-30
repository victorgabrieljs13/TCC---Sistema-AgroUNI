protegerPagina();

const feirante = getFeiranteLogado();
document.getElementById('nome-feirante').textContent = `Olá, ${feirante.nome}`;
document.getElementById('btn-logout').addEventListener('click', fazerLogout);

const formProduto = document.getElementById('form-produto');
const mensagemErro = document.getElementById('mensagem-erro');
const mensagemSucesso = document.getElementById('mensagem-sucesso');
const tituloFormulario = document.getElementById('titulo-formulario');
const btnSalvar = document.getElementById('btn-salvar');

// Verifica se veio um "id" na URL (ex: cadastro-produto.html?id=3) -> modo edição
const parametrosUrl = new URLSearchParams(window.location.search);
const idProduto = parametrosUrl.get('id');
const modoEdicao = idProduto !== null;

// Se for edição, muda os textos da tela e carrega os dados do produto
if (modoEdicao) {
    tituloFormulario.textContent = 'Editar Produto';
    btnSalvar.textContent = 'Atualizar Produto';
    carregarDadosProduto();
}

async function carregarDadosProduto() {
    try {
        const resposta = await fetch(`${API_URL}/produtos/${idProduto}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (!resposta.ok) {
            mensagemErro.textContent = 'Produto não encontrado.';
            mensagemErro.style.display = 'block';
            return;
        }

        const produto = await resposta.json();

        document.getElementById('nome').value = produto.nome;
        document.getElementById('categoria').value = produto.categoria || '';
        document.getElementById('unidade_medida').value = produto.unidade_medida;
        document.getElementById('preco_atual').value = produto.preco_atual;
        document.getElementById('quantidade_estoque').value = produto.quantidade_estoque;
        document.getElementById('estoque_minimo').value = produto.estoque_minimo;
        document.getElementById('status').value = produto.status;

    } catch (erro) {
        console.error(erro);
        mensagemErro.textContent = 'Erro ao carregar dados do produto.';
        mensagemErro.style.display = 'block';
    }
}

formProduto.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    mensagemErro.style.display = 'none';
    mensagemSucesso.style.display = 'none';

    const dadosProduto = {
        nome: document.getElementById('nome').value,
        categoria: document.getElementById('categoria').value,
        unidade_medida: document.getElementById('unidade_medida').value,
        preco_atual: parseFloat(document.getElementById('preco_atual').value),
        quantidade_estoque: parseFloat(document.getElementById('quantidade_estoque').value),
        estoque_minimo: parseFloat(document.getElementById('estoque_minimo').value),
        status: document.getElementById('status').value
    };

    try {
        const url = modoEdicao ? `${API_URL}/produtos/${idProduto}` : `${API_URL}/produtos`;
        const metodo = modoEdicao ? 'PUT' : 'POST';

        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(dadosProduto)
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mensagemErro.textContent = dados.mensagem;
            mensagemErro.style.display = 'block';
            return;
        }

        mensagemSucesso.textContent = dados.mensagem;
        mensagemSucesso.style.display = 'block';

        // Depois de salvar, volta pra lista de produtos em 1 segundo
        setTimeout(() => {
            window.location.href = 'produtos.html';
        }, 1000);

    } catch (erro) {
        console.error(erro);
        mensagemErro.textContent = 'Erro ao salvar produto. Verifique se o back-end está rodando.';
        mensagemErro.style.display = 'block';
    }
});