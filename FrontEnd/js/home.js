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
