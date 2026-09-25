protegerPagina();

const feirante = getFeiranteLogado();
document.getElementById('nome-feirante').textContent = feirante.nome;
document.getElementById('btn-logout').addEventListener('click', fazerLogout);

const formProduto = document.getElementById('form-produto');
const tituloFormulario = document.getElementById('titulo-formulario');
const btnSalvar = document.getElementById('btn-salvar');

const parametrosUrl = new URLSearchParams(window.location.search);
const idProduto = parametrosUrl.get('id');
const modoEdicao = idProduto !== null;

if (modoEdicao) {
    tituloFormulario.textContent = 'Editar produto';
    btnSalvar.textContent = 'Atualizar produto';
    carregarDadosProduto();
}

async function carregarDadosProduto() {
    try {
        const resposta = await fetch(`${API_URL}/produtos/${idProduto}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (!resposta.ok) {
            toast('Produto não encontrado.', 'erro');
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
        toast('Erro ao carregar dados do produto.', 'erro');
    }
}

formProduto.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const dadosProduto = {
        nome: document.getElementById('nome').value,
        categoria: document.getElementById('categoria').value,
        unidade_medida: document.getElementById('unidade_medida').value,
        preco_atual: parseFloat(document.getElementById('preco_atual').value),
        quantidade_estoque: parseFloat(document.getElementById('quantidade_estoque').value),
        estoque_minimo: parseFloat(document.getElementById('estoque_minimo').value),
        status: document.getElementById('status').value
    };

    definirCarregando(btnSalvar, true);

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
            toast(dados.mensagem, 'erro');
            definirCarregando(btnSalvar, false);
            return;
        }

        toast(dados.mensagem, 'sucesso');
        setTimeout(() => {
            window.location.href = 'produtos.html';
        }, 700);

    } catch (erro) {
        console.error(erro);
        toast('Erro ao salvar produto. Verifique se o back-end está rodando.', 'erro');
        definirCarregando(btnSalvar, false);
    }
});
