document.querySelectorAll('.aba-btn').forEach(botao => {
    botao.addEventListener('click', () => {
        document.querySelectorAll('.aba-btn').forEach(b => b.setAttribute('aria-selected', 'false'));
        botao.setAttribute('aria-selected', 'true');

        document.querySelectorAll('.passos').forEach(p => p.classList.remove('ativo'));
        document.getElementById(`passos-${botao.dataset.aba}`).classList.add('ativo');
    });
});
