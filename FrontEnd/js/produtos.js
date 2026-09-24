protegerPagina();

const feirante = getFeiranteLogado();
document.getElementById('nome-feirante').textContent = feirante.nome;
document.getElementById('btn-logout').addEventListener('click', fazerLogout);

const corpoTabela = document.getElementById('corpo-tabela');
const estadoVazio = document.getElementById('estado-vazio');
const tabelaWrap = document.querySelector('.table-wrap');

async function carregarProdutos() {
    try {
        const resposta = await fetch(`${API_URL}/produtos`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (resposta.status === 401) { fazerLogout(); return; }

        const produtos = await resposta.json();

        if (produtos.length === 0) {
            tabelaWrap.style.display = 'none';
            estadoVazio.style.display = 'block';
            return;
        }

        corpoTabela.innerHTML = '';

        produtos.forEach(produto => {
            const estoqueBaixo = parseFloat(produto.quantidade_estoque) <= parseFloat(produto.estoque_minimo);

            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td data-label="Produto">${produto.nome}</td>
                <td data-label="Categoria">${produto.categoria || '—'}</td>
                <td data-label="Preço">R$ ${parseFloat(produto.preco_atual).toFixed(2)}</td>
                <td data-label="Estoque">
                    <span class="pill ${estoqueBaixo ? 'pill-baixo' : ''}">${produto.quantidade_estoque} ${produto.unidade_medida}${estoqueBaixo ? ' · baixo' : ''}</span>
                </td>
                <td data-label="Status">${produto.status}</td>
                <td data-label="">
                    <div class="row-actions">
                        <a href="cadastro-produto.html?id=${produto.id}">Editar</a>
                        <button class="excluir" data-id="${produto.id}">Excluir</button>
                    </div>
                </td>`;
            corpoTabela.appendChild(linha);
        });

        corpoTabela.querySelectorAll('.excluir').forEach(botao => {
            botao.addEventListener('click', () => excluirProduto(botao.dataset.id));
        });

    } catch (erro) {
        console.error(erro);
        toast('Não foi possível carregar os produtos.', 'erro');
    }
}

async function excluirProduto(id) {
    const ok = await confirmar('Excluir produto', 'Essa ação não pode ser desfeita.', 'Excluir');
    if (!ok) return;

    try {
        const resposta = await fetch(`${API_URL}/produtos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        const dados = await resposta.json();

        if (!resposta.ok) { toast(dados.mensagem, 'erro'); return; }

        toast('Produto excluído.', 'sucesso');
        carregarProdutos();
    } catch (erro) {
        console.error(erro);
        toast('Erro ao excluir produto.', 'erro');
    }
}

carregarProdutos();