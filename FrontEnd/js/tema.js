// Modo claro/escuro compartilhado por todas as telas.
// Carregar no <head> (sem defer) para aplicar o tema antes da pintura e evitar "piscada".
(function () {
    var CHAVE = 'tema';
    var raiz = document.documentElement;

    function lerSalvo() {
        try { var t = localStorage.getItem(CHAVE); return (t === 'dark' || t === 'light') ? t : null; }
        catch (e) { return null; }
    }

    function temaDoSistema() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function aplicar(tema, persistir) {
        raiz.setAttribute('data-theme', tema);
        if (persistir) { try { localStorage.setItem(CHAVE, tema); } catch (e) { /* modo privado */ } }
        document.querySelectorAll('.theme-toggle').forEach(function (c) { c.checked = tema === 'dark'; });
        document.querySelectorAll('[data-tema-toggle]').forEach(function (b) {
            b.setAttribute('aria-pressed', String(tema === 'dark'));
            b.setAttribute('title', tema === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
        });
    }

    window.alternarTema = function () {
        aplicar(raiz.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    };

    aplicar(lerSalvo() || temaDoSistema(), false);

    document.addEventListener('DOMContentLoaded', function () {
        aplicar(raiz.getAttribute('data-theme'), false);
        document.querySelectorAll('.theme-toggle').forEach(function (c) { c.addEventListener('change', window.alternarTema); });
        document.querySelectorAll('[data-tema-toggle]').forEach(function (b) { b.addEventListener('click', window.alternarTema); });
    });

    // Sem escolha manual, acompanha o tema do sistema.
    if (window.matchMedia) {
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        var seguir = function (e) { if (!lerSalvo()) aplicar(e.matches ? 'dark' : 'light', false); };
        if (mq.addEventListener) mq.addEventListener('change', seguir);
    }
})();
