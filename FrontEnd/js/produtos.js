protegerPagina(); // se não estiver logado, redireciona pro login antes de mais nada

const corpoTabela = document.getElementById('corpo-tabela');
const listaVazia = document.getElementById('lista-vazia');
const mensagemErro = document.getElementById('mensagem-erro');
const nomeFeiranteSpan = document.getElementById('nome-feirante');

// Mostra o nome do feirante logado no topo
const feirante = getFeiranteLogado();
if (feirante) {
    nomeFeiranteSpan.textContent = `Olá, ${feirante.nome}`;
}

document.getElementById('btn-logout').addEventListener('click', fazerLogout);

async function carregarProdutos() {
    try {
        const resposta = await fetch(`${API_URL}/produtos`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (resposta.status === 401) {
            // Token expirado ou inválido: manda de volta pro login
            fazerLogout();
            return;
        }

        const produtos = await resposta.json();

        if (produtos.length === 0) {
            listaVazia.style.display = 'block';
            return;
        }

        corpoTabela.innerHTML = ''; // limpa antes de preencher

        produtos.forEach(produto => {
            const estoqueBaixo = parseFloat(produto.quantidade_estoque) <= parseFloat(produto.estoque_minimo);

            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.categoria || '-'}</td>
                <td>R$ ${parseFloat(produto.preco_atual).toFixed(2)}</td>
                <td class="${estoqueBaixo ? 'estoque-baixo' : ''}">
                    ${produto.quantidade_estoque} ${produto.unidade_medida} ${estoqueBaixo ? '⚠️' : ''}
                </td>
                <td>${produto.status}</td>
                <td>
                    <a class="acao-link" href="cadastro-produto.html?id=${produto.id}">Editar</a>
                    <a class="acao-link excluir" onclick="excluirProduto(${produto.id})">Excluir</a>
                </td>
            `;
            corpoTabela.appendChild(linha);
        });

    } catch (erro) {
        console.error(erro);
        mensagemErro.textContent = 'Erro ao carregar produtos. Verifique se o back-end está rodando.';
        mensagemErro.style.display = 'block';
    }
}

async function excluirProduto(id) {
    const confirmar = confirm('Tem certeza que deseja excluir esse produto?');
    if (!confirmar) return;

    try {
        const resposta = await fetch(`${API_URL}/produtos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!resposta.ok) {
            const dados = await resposta.json();
            alert(dados.mensagem);
            return;
        }

        carregarProdutos(); // recarrega a lista depois de excluir
    } catch (erro) {
        console.error(erro);
        alert('Erro ao excluir produto.');
    }
}

carregarProdutos();