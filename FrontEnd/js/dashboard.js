protegerPagina();

const feirante = getFeiranteLogado();
document.getElementById('nome-feirante').textContent = `Olá, ${feirante.nome}`;
document.getElementById('btn-logout').addEventListener('click', fazerLogout);

let listaProdutos = [];
let graficoPrecos = null; // guarda a instância do gráfico pra poder destruir e recriar

async function carregarDashboard() {
    try {
        const resposta = await fetch(`${API_URL}/produtos`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (resposta.status === 401) {
            fazerLogout();
            return;
        }

        listaProdutos = await resposta.json();

        preencherCards();
        montarGraficoEstoque();
        preencherSelectProdutos();

    } catch (erro) {
        console.error(erro);
    }
}

function preencherCards() {
    const totalProdutos = listaProdutos.length;

    const produtosEstoqueBaixo = listaProdutos.filter(
        p => parseFloat(p.quantidade_estoque) <= parseFloat(p.estoque_minimo)
    ).length;

    const valorTotal = listaProdutos.reduce(
        (soma, p) => soma + (parseFloat(p.preco_atual) * parseFloat(p.quantidade_estoque)),
        0
    );

    document.getElementById('card-total-produtos').textContent = totalProdutos;
    document.getElementById('card-estoque-baixo').textContent = produtosEstoqueBaixo;
    document.getElementById('card-valor-total').textContent =
        valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function montarGraficoEstoque() {
    const ctx = document.getElementById('grafico-estoque');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: listaProdutos.map(p => p.nome),
            datasets: [{
                label: 'Estoque atual',
                data: listaProdutos.map(p => parseFloat(p.quantidade_estoque)),
                backgroundColor: listaProdutos.map(p =>
                    parseFloat(p.quantidade_estoque) <= parseFloat(p.estoque_minimo) ? '#c62828' : '#2e7d32'
                )
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}

function preencherSelectProdutos() {
    const select = document.getElementById('select-produto-historico');

    listaProdutos.forEach(produto => {
        const opcao = document.createElement('option');
        opcao.value = produto.id;
        opcao.textContent = produto.nome;
        select.appendChild(opcao);
    });

    select.addEventListener('change', () => {
        if (select.value) {
            carregarHistoricoPreco(select.value);
        }
    });

    // Carrega o histórico do primeiro produto automaticamente, se existir
    if (listaProdutos.length > 0) {
        carregarHistoricoPreco(listaProdutos[0].id);
    }
}

async function carregarHistoricoPreco(idProduto) {
    const semHistorico = document.getElementById('sem-historico');
    const canvas = document.getElementById('grafico-precos');

    try {
        const resposta = await fetch(`${API_URL}/produtos/${idProduto}/historico`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        const dados = await resposta.json();

        if (dados.historico.length === 0) {
            semHistorico.style.display = 'block';
            canvas.style.display = 'none';
            return;
        }

        semHistorico.style.display = 'none';
        canvas.style.display = 'block';

        const labels = dados.historico.map(h =>
            new Date(h.data_alteracao).toLocaleDateString('pt-BR')
        );
        const precos = dados.historico.map(h => parseFloat(h.preco_novo));

        // Se já existe um gráfico desenhado, destrói antes de criar outro (senão sobrepõe)
        if (graficoPrecos) {
            graficoPrecos.destroy();
        }

        graficoPrecos = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: `Preço - ${dados.produto}`,
                    data: precos,
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    tension: 0.2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } }
            }
        });

    } catch (erro) {
        console.error(erro);
    }
}

carregarDashboard();