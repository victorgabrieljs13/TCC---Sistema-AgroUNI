protegerPagina();

const feirante = getFeiranteLogado();
document.getElementById('nome-feirante').textContent = feirante.nome;
document.getElementById('btn-logout').addEventListener('click', fazerLogout);

const listaPedidos = document.getElementById('lista-pedidos');
const estadoVazio = document.getElementById('estado-vazio');
const filtroTabs = document.getElementById('filtro-tabs');

let todosPedidos = [];
let filtroAtivo = 'pendente'; // padrão: mostra primeiro o que precisa de ação

function formatarPreco(valor) {
    return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data) {
    return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function calcularTotalPedido(pedido) {
    return pedido.itens.reduce(
        (soma, item) => soma + (parseFloat(item.preco_unitario) * parseFloat(item.quantidade)),
        0
    );
}

async function carregarPedidos() {
    try {
        const resposta = await fetch(`${API_URL}/pedidos`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (resposta.status === 401) { fazerLogout(); return; }

        todosPedidos = await resposta.json();
        renderizarPedidos();
    } catch (erro) {
        console.error(erro);
        toast('Não foi possível carregar os pedidos.', 'erro');
    }
}

function renderizarPedidos() {
    const filtrados = filtroAtivo === 'todos'
        ? todosPedidos
        : todosPedidos.filter(pedido => pedido.status === filtroAtivo);

    listaPedidos.innerHTML = '';

    if (filtrados.length === 0) {
        estadoVazio.style.display = 'block';
        return;
    }

    estadoVazio.style.display = 'none';
    filtrados.forEach(pedido => listaPedidos.appendChild(criarCardPedido(pedido)));
}

function criarCardPedido(pedido) {
    const card = document.createElement('div');
    card.className = 'card pedido-card';

    const classePill = pedido.status === 'pendente' ? 'pill-pendente'
        : pedido.status === 'recusado' ? 'pill-recusado'
        : '';

    const rotuloStatus = pedido.status === 'pendente' ? 'Pendente'
        : pedido.status === 'aceito' ? 'Aceito'
        : 'Recusado';

    const itensHtml = pedido.itens.map(item => `
        <li>
            <span><span class="num">${item.quantidade}</span> ${item.unidade_medida} · ${item.produto_nome}</span>
            <span class="num">${formatarPreco(item.preco_unitario * item.quantidade)}</span>
        </li>
    `).join('');

    card.innerHTML = `
        <div class="pedido-card__topo">
            <div>
                <div class="pedido-card__cliente">${pedido.nome_cliente}</div>
                <div class="pedido-card__contato">${pedido.telefone_cliente}</div>
            </div>
            <div style="text-align: right;">
                <span class="pill ${classePill}">${rotuloStatus}</span>
                <div class="pedido-card__data">${formatarData(pedido.data_pedido)}</div>
            </div>
        </div>
        <ul class="pedido-card__itens">${itensHtml}</ul>
        <div class="pedido-card__total"><span>Total</span><span class="num">${formatarPreco(calcularTotalPedido(pedido))}</span></div>
        ${pedido.status === 'pendente' ? `
            <div class="pedido-card__acoes">
                <button type="button" class="btn btn-secondary btn-recusar">Recusar</button>
                <button type="button" class="btn btn-primary btn-aceitar">Aceitar</button>
            </div>
        ` : ''}
    `;

    if (pedido.status === 'pendente') {
        card.querySelector('.btn-aceitar').addEventListener('click', (evento) => aceitarPedido(pedido.id, evento.currentTarget));
        card.querySelector('.btn-recusar').addEventListener('click', (evento) => recusarPedido(pedido.id, evento.currentTarget));
    }

    return card;
}

async function aceitarPedido(id, botao) {
    const ok = await confirmar('Aceitar pedido', 'O estoque dos produtos será debitado automaticamente.', 'Aceitar');
    if (!ok) return;

    definirCarregando(botao, true, 'Aceitando...');

    try {
        const resposta = await fetch(`${API_URL}/pedidos/${id}/aceitar`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            const detalhe = dados.produtos ? ` (${dados.produtos.join(', ')})` : '';
            toast(dados.mensagem + detalhe, 'erro');
            definirCarregando(botao, false);
            return;
        }

        toast(dados.mensagem, 'sucesso');
        carregarPedidos();
    } catch (erro) {
        console.error(erro);
        toast('Erro ao aceitar pedido.', 'erro');
        definirCarregando(botao, false);
    }
}

async function recusarPedido(id, botao) {
    const ok = await confirmar('Recusar pedido', 'Essa ação não pode ser desfeita.', 'Recusar');
    if (!ok) return;

    definirCarregando(botao, true, 'Recusando...');

    try {
        const resposta = await fetch(`${API_URL}/pedidos/${id}/recusar`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            toast(dados.mensagem, 'erro');
            definirCarregando(botao, false);
            return;
        }

        toast(dados.mensagem, 'sucesso');
        carregarPedidos();
    } catch (erro) {
        console.error(erro);
        toast('Erro ao recusar pedido.', 'erro');
        definirCarregando(botao, false);
    }
}

filtroTabs.addEventListener('click', (evento) => {
    const botao = evento.target.closest('button[data-filtro]');
    if (!botao) return;

    filtroTabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    botao.classList.add('active');
    filtroAtivo = botao.dataset.filtro;
    renderizarPedidos();
});

carregarPedidos();
