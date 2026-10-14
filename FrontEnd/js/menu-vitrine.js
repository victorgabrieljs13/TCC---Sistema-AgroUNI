// Menu da vitrine: abre/fecha o painel no celular
(function () {
    const menu = document.getElementById('vtMenu');
    const botao = document.getElementById('vtMenuBtn');
    if (!menu || !botao) return;

    function definir(aberto) {
        menu.classList.toggle('vt-menu--aberto', aberto);
        botao.setAttribute('aria-expanded', String(aberto));
        botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    }

    botao.addEventListener('click', (e) => {
        e.stopPropagation();
        definir(!menu.classList.contains('vt-menu--aberto'));
    });
    document.addEventListener('click', (e) => { if (!menu.contains(e.target)) definir(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') definir(false); });
    menu.querySelectorAll('.vt-menu__links > a').forEach((a) => a.addEventListener('click', () => definir(false)));
})();
