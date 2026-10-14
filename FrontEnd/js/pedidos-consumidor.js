if (!getTokenConsumidor()) {
    window.location.href = 'login-consumidor.html';
}

const consumidor = getConsumidorLogado();
document.getElementById('nomeConsumidor').textContent = consumidor.nome;
document.getElementById('botaoSair').addEventListener('click', fazerLogoutConsumidor);

const elLista = document.getElementById('listaMeusPedidos');
const elEstadoVazio = document.getElementById('estadoVazio');

function formatarPreco(valor) {
    return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data) {
    return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

async function carregarMeusPedidos() {
    try {
        const resposta = await fetch(`${API_URL}/pedidos/meus`, {
            headers: { 'Authorization': `Bearer ${getTokenConsumidor()}` },
        });

        if (resposta.status === 401 || resposta.status === 403) {
            fazerLogoutConsumidor();
            return;
        }

        const pedidos = await resposta.json();

        if (pedidos.length === 0) {
            elEstadoVazio.hidden = false;
            return;
        }

        pedidos.forEach((pedido) => elLista.appendChild(criarCardPedido(pedido)));
    } catch (erro) {
        console.error(erro);
    }
}

function criarCardPedido(pedido) {
    const classeStatus = `vt-pedido-historico__status--${pedido.status}`;
    const rotuloStatus = pedido.status === 'pendente' ? 'Aguardando confirmação'
        : pedido.status === 'aceito' ? 'Confirmado'
        : 'Recusado';

    const total = pedido.itens.reduce(
        (soma, item) => soma + (parseFloat(item.preco_unitario) * parseFloat(item.quantidade)),
        0
    );

    const itensHtml = pedido.itens.map((item) => `
        <li>${item.quantidade} ${item.unidade_medida} · ${item.produto_nome}</li>
    `).join('');

    const div = document.createElement('article');
    div.className = 'vt-pedido-historico';
    div.innerHTML = `
        <p class="vt-pedido-historico__meta">Banca de ${pedido.feirante_nome} · ${formatarData(pedido.data_pedido)}</p>
        <span class="vt-pedido-historico__status ${classeStatus}">${rotuloStatus}</span>
        <ul class="vt-pedido-historico__itens">${itensHtml}</ul>
        <strong class="vt-pedido-historico__total">${formatarPreco(total)}</strong>
    `;
    return div;
}

carregarMeusPedidos();
