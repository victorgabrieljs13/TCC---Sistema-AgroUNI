// ============================================================================
// VITRINE PÚBLICA — AgroUNI
// Espera que config.js já tenha definido a constante global API_URL
// (mesmo padrão usado em produtos.js, dashboard.js etc).
//
// Formato real confirmado do GET /vitrine (testado via Thunder Client),
// mais os campos descricao/imagem_url adicionados depois (confirma se o
// vitrineController.js já inclui p.descricao, p.imagem_url no SELECT):
// [{
//   id, nome, categoria, descricao, imagem_url, unidade_medida,
//   preco_atual (string), quantidade_estoque (string),
//   feirante_id, feirante_nome, feirante_box
// }]
//
// Espera também que consumidor.js já tenha sido carregado antes deste
// arquivo (define getConsumidorLogado() e fazerLogoutConsumidor()).
// ============================================================================

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // estado
  // -------------------------------------------------------------------------

  let todosProdutos = [];
  let categoriaAtiva = null;
  let textoBusca = '';

  const carrinho = {
    feiranteId: null,
    feiranteNome: null,
    itens: new Map(), // produto_id -> { produto, quantidade }
  };

  // -------------------------------------------------------------------------
  // elementos
  // -------------------------------------------------------------------------

  const elConteudo = document.getElementById('conteudoVitrine');
  const elFiltros = document.getElementById('filtrosCategoria');
  const elBusca = document.getElementById('campoBusca');

  const elBotaoCesta = document.getElementById('botaoCesta');
  const elCestaQtd = document.getElementById('cestaQtd');
  const elCestaTotal = document.getElementById('cestaTotal');

  const elPainelCesta = document.getElementById('painelCesta');
  const elFecharCesta = document.getElementById('fecharCesta');
  const elCestaBancaNome = document.getElementById('cestaBancaNome');
  const elCestaItens = document.getElementById('cestaItens');
  const elCestaPainelTotal = document.getElementById('cestaPainelTotal');
  const elFormReserva = document.getElementById('formReserva');
  const elBotaoEnviarPedido = document.getElementById('botaoEnviarPedido');

  const elPainelSucesso = document.getElementById('painelSucesso');
  const elMensagemSucesso = document.getElementById('mensagemSucesso');
  const elFecharSucesso = document.getElementById('fecharSucesso');

  const elAreaConta = document.getElementById('areaConta');
  const elOpcoesPagamento = document.getElementById('opcoesPagamento');
  const elPainelProcessando = document.getElementById('painelProcessando');
  const elTituloProcessando = document.getElementById('tituloProcessando');
  const elMensagemProcessando = document.getElementById('mensagemProcessando');

  let metodoPagamentoSelecionado = null;

  // -------------------------------------------------------------------------
  // utilitários
  // -------------------------------------------------------------------------

  function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function normalizarProduto(item) {
    return {
      produto_id: item.produto_id ?? item.id,
      nome: item.nome,
      categoria: item.categoria,
      descricao: item.descricao ?? null,
      imagem_url: item.imagem_url ?? null,
      unidade_medida: item.unidade_medida,
      preco_atual: Number(item.preco_atual),
      quantidade_estoque: Number(item.quantidade_estoque),
      feirante_id: item.feirante_id,
      feirante_nome: item.feirante_nome ?? item.nome_feirante ?? `Feirante #${item.feirante_id}`,
      box: item.feirante_box ?? item.box ?? null,
    };
  }

  function mostrarToast(mensagem) {
    const toast = document.createElement('div');
    toast.className = 'vt-toast';
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  function renderizarAreaConta() {
    const consumidor = typeof getConsumidorLogado === 'function' ? getConsumidorLogado() : null;

    if (consumidor) {
      const primeiroNome = consumidor.nome.split(' ')[0];
      elAreaConta.innerHTML = `
        <span>Olá, ${primeiroNome}</span>
        <a href="pedidos-consumidor.html">Meus pedidos</a>
        <button type="button" id="botaoSairConta">Sair</button>
      `;
      document.getElementById('botaoSairConta').addEventListener('click', fazerLogoutConsumidor);
    } else {
      elAreaConta.innerHTML = `
        <a href="login-consumidor.html">Entrar</a>
        <a href="cadastro-consumidor.html">Criar conta</a>
      `;
    }
  }

  // -------------------------------------------------------------------------
  // carregar vitrine
  // -------------------------------------------------------------------------

  async function carregarVitrine() {
    try {
      const resposta = await fetch(`${API_URL}/vitrine`);

      if (!resposta.ok) {
        throw new Error('Falha ao carregar vitrine');
      }

      const dados = await resposta.json();
      todosProdutos = dados.map(normalizarProduto);

      if (todosProdutos.length === 0) {
        renderizarVazio();
        return;
      }

      popularFiltrosCategoria();
      renderizarVitrine();
    } catch (erro) {
      renderizarErro();
    }
  }

  function renderizarVazio() {
    elConteudo.innerHTML = `
      <div class="vt-estado">
        <p class="vt-estado__selo">Nenhuma banca aberta agora</p>
        <p>Volta mais tarde — os feirantes atualizam a vitrine ao longo do dia.</p>
      </div>
    `;
  }

  function renderizarErro() {
    elConteudo.innerHTML = `
      <div class="vt-estado">
        <p class="vt-estado__selo">Não foi possível carregar a feira agora</p>
        <p>Pode ser o servidor acordando — tenta de novo em alguns segundos.</p>
        <button class="vt-estado__acao" id="botaoTentarNovamente">Tentar novamente</button>
      </div>
    `;
    document.getElementById('botaoTentarNovamente').addEventListener('click', () => {
      elConteudo.innerHTML = `
        <div class="vt-estado">
          <p class="vt-estado__selo">Abrindo a feira…</p>
          <p>Isso pode levar alguns segundos.</p>
        </div>
      `;
      carregarVitrine();
    });
  }

  // -------------------------------------------------------------------------
  // filtros
  // -------------------------------------------------------------------------

  function popularFiltrosCategoria() {
    const categorias = [...new Set(todosProdutos.map((p) => p.categoria).filter(Boolean))];

    elFiltros.innerHTML = '';

    const chipTodos = criarChip('Todos', categoriaAtiva === null);
    chipTodos.addEventListener('click', () => {
      categoriaAtiva = null;
      atualizarChipsAtivos();
      renderizarVitrine();
    });
    elFiltros.appendChild(chipTodos);

    categorias.forEach((categoria) => {
      const chip = criarChip(categoria, categoriaAtiva === categoria);
      chip.addEventListener('click', () => {
        categoriaAtiva = categoria;
        atualizarChipsAtivos();
        renderizarVitrine();
      });
      elFiltros.appendChild(chip);
    });
  }

  function criarChip(rotulo, ativo) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'vt-filtro-chip';
    botao.textContent = rotulo;
    botao.setAttribute('aria-pressed', String(ativo));
    return botao;
  }

  function atualizarChipsAtivos() {
    const chips = elFiltros.querySelectorAll('.vt-filtro-chip');
    chips.forEach((chip) => {
      const ehTodos = chip.textContent === 'Todos';
      const ativo = ehTodos ? categoriaAtiva === null : chip.textContent === categoriaAtiva;
      chip.setAttribute('aria-pressed', String(ativo));
    });
  }

  elBusca.addEventListener('input', (evento) => {
    textoBusca = evento.target.value.trim().toLowerCase();
    renderizarVitrine();
  });

  // -------------------------------------------------------------------------
  // renderizar vitrine (agrupada por feirante)
  // -------------------------------------------------------------------------

  function renderizarVitrine() {
    const filtrados = todosProdutos.filter((produto) => {
      const passaCategoria = !categoriaAtiva || produto.categoria === categoriaAtiva;
      const passaBusca = !textoBusca || produto.nome.toLowerCase().includes(textoBusca);
      return passaCategoria && passaBusca;
    });

    if (filtrados.length === 0) {
      elConteudo.innerHTML = `
        <div class="vt-estado">
          <p class="vt-estado__selo">Nada encontrado</p>
          <p>Tenta outro termo ou limpa os filtros.</p>
        </div>
      `;
      return;
    }

    const porFeirante = new Map();
    filtrados.forEach((produto) => {
      if (!porFeirante.has(produto.feirante_id)) {
        porFeirante.set(produto.feirante_id, []);
      }
      porFeirante.get(produto.feirante_id).push(produto);
    });

    elConteudo.innerHTML = '';

    porFeirante.forEach((produtos) => {
      elConteudo.appendChild(criarSecaoBanca(produtos));
    });
  }

  function criarSecaoBanca(produtos) {
    const primeiro = produtos[0];

    const secao = document.createElement('section');
    secao.className = 'vt-banca';
    secao.setAttribute('aria-label', `Banca de ${primeiro.feirante_nome}`);

    const tarjeta = document.createElement('div');
    tarjeta.className = 'vt-banca__tarjeta';
    tarjeta.innerHTML = `
      <span class="vt-banca__nome">${primeiro.feirante_nome}</span>
      ${primeiro.box ? `<span class="vt-banca__box">Box ${primeiro.box}</span>` : ''}
    `;
    secao.appendChild(tarjeta);

    const grade = document.createElement('div');
    grade.className = 'vt-banca__grade';
    produtos.forEach((produto) => grade.appendChild(criarCartaoProduto(produto)));
    secao.appendChild(grade);

    return secao;
  }

  function criarCartaoProduto(produto) {
    const jaNoCarrinho = carrinho.itens.get(produto.produto_id);
    const quantidadeAtual = jaNoCarrinho ? jaNoCarrinho.quantidade : 0;
    const estoqueBaixo = produto.quantidade_estoque <= 5;

    const imagemHtml = produto.imagem_url
      ? `<img src="${produto.imagem_url}" alt="${produto.nome}" class="vt-produto__imagem" onerror="this.remove()">`
      : '';
    const descricaoHtml = produto.descricao
      ? `<p class="vt-produto__descricao">${produto.descricao}</p>`
      : '';

    const cartao = document.createElement('article');
    cartao.className = 'vt-produto';
    cartao.innerHTML = `
      ${imagemHtml}
      <p class="vt-produto__categoria">${produto.categoria ?? ''}</p>
      <h3 class="vt-produto__nome">${produto.nome}</h3>
      ${descricaoHtml}
      <div>
        <span class="vt-produto__preco">${formatarPreco(produto.preco_atual)}</span>
        <span class="vt-produto__unidade">/${produto.unidade_medida}</span>
      </div>
      <p class="vt-produto__estoque ${estoqueBaixo ? 'vt-produto__estoque--baixo' : ''}">
        ${estoqueBaixo ? `Só ${produto.quantidade_estoque} disponíveis` : 'Disponível'}
      </p>
      <div class="vt-produto__rodape">
        <div class="vt-produto__stepper">
          <button type="button" data-acao="diminuir" aria-label="Diminuir quantidade">−</button>
          <span data-papel="quantidade">${quantidadeAtual}</span>
          <button type="button" data-acao="aumentar" aria-label="Aumentar quantidade">+</button>
        </div>
        <button type="button" class="vt-produto__botao-add">Adicionar</button>
      </div>
    `;

    const elQuantidade = cartao.querySelector('[data-papel="quantidade"]');
    const botaoDiminuir = cartao.querySelector('[data-acao="diminuir"]');
    const botaoAumentar = cartao.querySelector('[data-acao="aumentar"]');
    const botaoAdicionar = cartao.querySelector('.vt-produto__botao-add');

    let quantidadeSelecionada = Math.max(1, quantidadeAtual || 1);
    elQuantidade.textContent = String(quantidadeSelecionada);

    botaoDiminuir.addEventListener('click', () => {
      quantidadeSelecionada = Math.max(1, quantidadeSelecionada - 1);
      elQuantidade.textContent = String(quantidadeSelecionada);
    });

    botaoAumentar.addEventListener('click', () => {
      quantidadeSelecionada = Math.min(produto.quantidade_estoque, quantidadeSelecionada + 1);
      elQuantidade.textContent = String(quantidadeSelecionada);
    });

    botaoAdicionar.addEventListener('click', () => {
      adicionarAoCarrinho(produto, quantidadeSelecionada);
    });

    return cartao;
  }

  // -------------------------------------------------------------------------
  // carrinho / cesta
  // -------------------------------------------------------------------------

  function adicionarAoCarrinho(produto, quantidade) {
    if (carrinho.feiranteId !== null && carrinho.feiranteId !== produto.feirante_id) {
      mostrarToast('Sua reserva é só com um feirante por vez. Termina ou esvazia a cesta pra trocar de banca.');
      return;
    }

    carrinho.feiranteId = produto.feirante_id;
    carrinho.feiranteNome = produto.feirante_nome;
    carrinho.itens.set(produto.produto_id, { produto, quantidade });

    atualizarBotaoCesta();
    mostrarToast(`${produto.nome} adicionado à reserva.`);
  }

  function removerDoCarrinho(produtoId) {
    carrinho.itens.delete(produtoId);

    if (carrinho.itens.size === 0) {
      carrinho.feiranteId = null;
      carrinho.feiranteNome = null;
    }

    atualizarBotaoCesta();
    renderizarItensCesta();
  }

  function calcularTotal() {
    let total = 0;
    carrinho.itens.forEach(({ produto, quantidade }) => {
      total += produto.preco_atual * quantidade;
    });
    return total;
  }

  function atualizarBotaoCesta() {
    const qtdItens = carrinho.itens.size;
    elCestaQtd.textContent = String(qtdItens);
    elCestaTotal.textContent = formatarPreco(calcularTotal());
    elBotaoCesta.hidden = qtdItens === 0;
  }

  function renderizarItensCesta() {
    elCestaBancaNome.textContent = carrinho.feiranteNome ? `Banca de ${carrinho.feiranteNome}` : '';
    elCestaItens.innerHTML = '';

    carrinho.itens.forEach(({ produto, quantidade }) => {
      const li = document.createElement('li');
      li.className = 'vt-cesta-item';
      li.innerHTML = `
        <div class="vt-cesta-item__info">
          <span class="vt-cesta-item__nome">${quantidade}x ${produto.nome}</span>
          <span class="vt-cesta-item__preco">${formatarPreco(produto.preco_atual * quantidade)}</span>
        </div>
        <button type="button" class="vt-cesta-item__remover">Remover</button>
      `;
      li.querySelector('.vt-cesta-item__remover').addEventListener('click', () => {
        removerDoCarrinho(produto.produto_id);
      });
      elCestaItens.appendChild(li);
    });

    elCestaPainelTotal.textContent = formatarPreco(calcularTotal());
  }

  elBotaoCesta.addEventListener('click', () => {
    renderizarItensCesta();
    elPainelCesta.hidden = false;

    const consumidor = typeof getConsumidorLogado === 'function' ? getConsumidorLogado() : null;
    if (consumidor) {
      document.getElementById('inputNome').value = consumidor.nome;
      document.getElementById('inputTelefone').value = consumidor.telefone;
    }

    document.getElementById('inputNome').focus();
  });

  elOpcoesPagamento.querySelectorAll('.vt-pagamento__opcao').forEach((botao) => {
    botao.addEventListener('click', () => {
      elOpcoesPagamento.querySelectorAll('.vt-pagamento__opcao').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      botao.setAttribute('aria-pressed', 'true');
      metodoPagamentoSelecionado = botao.dataset.metodo;
    });
  });

  elFecharCesta.addEventListener('click', () => {
    elPainelCesta.hidden = true;
  });

  elPainelCesta.addEventListener('click', (evento) => {
    if (evento.target === elPainelCesta) {
      elPainelCesta.hidden = true;
    }
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') {
      elPainelCesta.hidden = true;
    }
  });

  // -------------------------------------------------------------------------
  // enviar pedido
  // -------------------------------------------------------------------------

  elFormReserva.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById('inputNome').value.trim();
    const telefoneDigitado = document.getElementById('inputTelefone').value.trim();
    const telefone = telefoneDigitado.replace(/\D/g, '');

    if (nome.length < 2) {
      mostrarToast('Digita seu nome, por favor.');
      return;
    }

    if (telefone.length < 10) {
      mostrarToast('Digita um telefone válido, com DDD.');
      return;
    }

    if (!metodoPagamentoSelecionado) {
      mostrarToast('Escolhe a forma de pagamento.');
      return;
    }

    if (metodoPagamentoSelecionado === 'dinheiro') {
      await enviarPedidoFinal(nome, telefone);
    } else {
      await simularPagamento(nome, telefone);
    }
  });

  // Simulação de pagamento (Pix/cartão) — NÃO processa nada de verdade,
  // é só uma etapa visual pra mostrar o fluxo completo. O pagamento real
  // continua combinado na retirada, como já era.
  async function simularPagamento(nome, telefone) {
    elPainelCesta.hidden = true;
    elPainelProcessando.hidden = false;

    elTituloProcessando.textContent = metodoPagamentoSelecionado === 'pix'
      ? 'Aguardando pagamento via Pix…'
      : 'Processando cartão…';
    elMensagemProcessando.textContent = 'Isso é só uma simulação — nada está sendo cobrado de verdade.';

    await new Promise((resolve) => setTimeout(resolve, 1800));

    elTituloProcessando.textContent = 'Pagamento aprovado ✓';
    elMensagemProcessando.textContent = 'Enviando sua reserva…';

    await new Promise((resolve) => setTimeout(resolve, 900));

    elPainelProcessando.hidden = true;
    await enviarPedidoFinal(nome, telefone);
  }

  async function enviarPedidoFinal(nome, telefone) {
    const consumidor = typeof getConsumidorLogado === 'function' ? getConsumidorLogado() : null;

    const corpo = {
      feirante_id: carrinho.feiranteId,
      nome_cliente: nome,
      telefone_cliente: telefone,
      forma_pagamento: metodoPagamentoSelecionado,
      consumidor_id: consumidor ? consumidor.id : null,
      itens: Array.from(carrinho.itens.values()).map(({ produto, quantidade }) => ({
        produto_id: produto.produto_id,
        quantidade,
      })),
    };

    elBotaoEnviarPedido.disabled = true;
    elBotaoEnviarPedido.textContent = 'Enviando…';

    try {
      const resposta = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || 'Não foi possível enviar o pedido.');
      }

      elMensagemSucesso.textContent = `${dados.mensagem} Guarda esse número: pedido #${dados.id}.`;
      elPainelCesta.hidden = true;
      elPainelSucesso.hidden = false;

      carrinho.itens.clear();
      carrinho.feiranteId = null;
      carrinho.feiranteNome = null;
      metodoPagamentoSelecionado = null;
      elOpcoesPagamento.querySelectorAll('.vt-pagamento__opcao').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      atualizarBotaoCesta();
      elFormReserva.reset();
    } catch (erro) {
      elPainelCesta.hidden = false;
      mostrarToast(erro.message || 'Não foi possível enviar o pedido. Tenta de novo.');
    } finally {
      elBotaoEnviarPedido.disabled = false;
      elBotaoEnviarPedido.textContent = 'Enviar reserva';
    }
  }

  elFecharSucesso.addEventListener('click', () => {
    elPainelSucesso.hidden = true;
    renderizarVitrine();
  });

  // -------------------------------------------------------------------------
  // início
  // -------------------------------------------------------------------------

  renderizarAreaConta();
  carregarVitrine();
})();
