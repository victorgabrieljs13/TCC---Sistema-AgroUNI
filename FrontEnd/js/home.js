document.querySelectorAll('.aba-btn').forEach(botao => {
    botao.addEventListener('click', () => {
        document.querySelectorAll('.aba-btn').forEach(b => b.setAttribute('aria-selected', 'false'));
        botao.setAttribute('aria-selected', 'true');

        document.querySelectorAll('.passos').forEach(p => p.classList.remove('ativo'));
        document.getElementById(`passos-${botao.dataset.aba}`).classList.add('ativo');
    });
});

const elementosReveal = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const observadorReveal = new IntersectionObserver((entradas, observador) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('reveal--ativo');
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.1 });

    elementosReveal.forEach(elemento => observadorReveal.observe(elemento));
} else {
    elementosReveal.forEach(elemento => elemento.classList.add('reveal--ativo'));
}

// 1. Seleção dos elementos do HTML através dos seus IDs
const headerMenu = document.getElementById('home-header');
const btnOcultar = document.getElementById('btnOcultarMenu');
const btnMostrar = document.getElementById('btnMostrarMenu');

// 2. Verifica se todos os elementos existem na página antes de adicionar os eventos
if (headerMenu && btnOcultar && btnMostrar) {
    
    // Ação ao clicar no botão "Ocultar"
    btnOcultar.addEventListener('click', () => {
        // Adiciona a classe que recolhe o menu para cima
        headerMenu.classList.add('home-topo--escondido-manual');
        // Exibe o botão flutuante "Menu" no canto superior
        btnMostrar.classList.add('btn-mostrar-menu--visivel');
    });

    // Ação ao clicar no botão flutuante "Menu" para reexibir
    btnMostrar.addEventListener('click', () => {
        // Remove a classe de recolher, trazendo o menu de volta
        headerMenu.classList.remove('home-topo--escondido-manual');
        // Esconde o botão flutuante
        btnMostrar.classList.remove('btn-mostrar-menu--visivel');
    });
}


// Menus suspensos (Entrar / Cadastrar)
const menusSuspensos = Array.from(document.querySelectorAll('.entrar-menu'));

function fecharMenusSuspensos(exceto) {
    menusSuspensos.forEach((menu) => {
        if (menu === exceto) return;
        menu.classList.remove('entrar-menu--aberto');
        const botao = menu.querySelector('.entrar--botao');
        if (botao) botao.setAttribute('aria-expanded', 'false');
    });
}

menusSuspensos.forEach((menu) => {
    const botao = menu.querySelector('.entrar--botao');
    const dropdown = menu.querySelector('.entrar-menu__dropdown');
    if (!botao || !dropdown) return;

    botao.addEventListener('click', (evento) => {
        evento.stopPropagation();
        fecharMenusSuspensos(menu);
        const aberto = menu.classList.toggle('entrar-menu--aberto');
        botao.setAttribute('aria-expanded', String(aberto));
    });
    dropdown.addEventListener('click', (evento) => evento.stopPropagation());
});

document.addEventListener('click', () => fecharMenusSuspensos());
document.addEventListener('keydown', (evento) => { if (evento.key === 'Escape') fecharMenusSuspensos(); });

// Menu hambúrguer (telas pequenas)
const btnMenuHome = document.getElementById('btnMenuHome');
if (btnMenuHome && headerMenu) {
    const definirMenuHome = (aberto) => {
        headerMenu.classList.toggle('home-topo--aberto', aberto);
        btnMenuHome.setAttribute('aria-expanded', String(aberto));
        btnMenuHome.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    };
    btnMenuHome.addEventListener('click', (e) => { e.stopPropagation(); fecharMenusSuspensos(); definirMenuHome(!headerMenu.classList.contains('home-topo--aberto')); });
    document.addEventListener('click', (e) => { if (!headerMenu.contains(e.target)) definirMenuHome(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') definirMenuHome(false); });
    headerMenu.querySelectorAll('.home-nav a').forEach((a) => a.addEventListener('click', () => definirMenuHome(false)));
}


// Destaca no menu a seção que está na tela (links com âncora #)
const linksNav = Array.from(document.querySelectorAll('.home-nav a[href^="#"]'));
const secoesNav = linksNav.map(link => document.querySelector(link.getAttribute('href')));

function marcarSecaoAtiva() {
    const posicao = window.scrollY + 160;
    let ativa = 0;
    secoesNav.forEach((secao, i) => { if (secao && secao.offsetTop <= posicao) ativa = i; });
    linksNav.forEach((link, i) => link.setAttribute('aria-current', i === ativa ? 'true' : 'false'));
}

if (linksNav.length) {
    window.addEventListener('scroll', marcarSecaoAtiva, { passive: true });
    marcarSecaoAtiva();
}
