protegerPagina();

const feirante = getFeiranteLogado();
document.getElementById('nome-feirante').textContent = feirante.nome;
document.getElementById('btn-logout').addEventListener('click', fazerLogout);

const selectProduto = document.getElementById('produto_id');
const formMovimentacao = document.getElementById('form-movimentacao');
const btnRegistrar = document.getElementById('btn-registrar');

async function carregarProdutosNoSelect() {
    try {
        const resposta = await fetch(`${API_URL}/produtos`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const produtos = await resposta.json();

        produtos.forEach(produto => {
            const opcao = document.createElement('option');
            opcao.value = produto.id;
            opcao.textContent = `${produto.nome} (estoque: ${produto.quantidade_estoque} ${produto.unidade_medida})`;
            selectProduto.appendChild(opcao);
        });
    } catch (erro) {
        console.error(erro);
        toast('Não foi possível carregar os produtos.', 'erro');
    }
}

formMovimentacao.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const dadosMovimentacao = {
        produto_id: selectProduto.value,
        tipo: document.getElementById('tipo').value,
        quantidade: parseFloat(document.getElementById('quantidade').value),
        motivo: document.getElementById('motivo').value
    };

    definirCarregando(btnRegistrar, true, 'Registrando...');

    try {
        const resposta = await fetch(`${API_URL}/movimentacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify(dadosMovimentacao)
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            toast(dados.mensagem, 'erro');
            definirCarregando(btnRegistrar, false);
            return;
        }

        toast(
            dados.alerta_estoque_baixo ? `${dados.mensagem} O estoque ficou abaixo do mínimo.` : dados.mensagem,
            dados.alerta_estoque_baixo ? 'aviso' : 'sucesso'
        );

        formMovimentacao.reset();
        setTimeout(() => { window.location.href = 'produtos.html'; }, 900);

    } catch (erro) {
        console.error(erro);
        toast('Erro ao registrar movimentação.', 'erro');
        definirCarregando(btnRegistrar, false);
    }
});

carregarProdutosNoSelect();