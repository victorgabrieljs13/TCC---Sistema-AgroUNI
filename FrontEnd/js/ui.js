// Componentes compartilhados: toast, modal de confirmação e loading de botão
// (o modo claro/escuro fica em js/tema.js)

(function () {
    function getToastContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    window.toast = function (mensagem, tipo = 'info', duracao = 4000) {
        const container = getToastContainer();
        const item = document.createElement('div');
        item.className = `toast toast-${tipo}`;
        item.innerHTML = `<span>${mensagem}</span><button class="toast-fechar" aria-label="Fechar">&times;</button>`;
        container.appendChild(item);

        const remover = () => {
            item.classList.add('toast-saindo');
            setTimeout(() => item.remove(), 200);
        };

        item.querySelector('.toast-fechar').addEventListener('click', remover);
        setTimeout(remover, duracao);
    };

    window.confirmar = function (titulo, mensagem, textoConfirmar = 'Confirmar') {
        return new Promise((resolve) => {
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            backdrop.innerHTML = `
                <div class="modal" role="alertdialog" aria-modal="true">
                    <h3>${titulo}</h3>
                    <p>${mensagem}</p>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" data-acao="cancelar">Cancelar</button>
                        <button class="btn btn-danger" data-acao="confirmar">${textoConfirmar}</button>
                    </div>
                </div>`;
            document.body.appendChild(backdrop);

            function fechar(resultado) {
                backdrop.remove();
                resolve(resultado);
            }

            backdrop.addEventListener('click', (e) => { if (e.target === backdrop) fechar(false); });
            backdrop.querySelector('[data-acao="cancelar"]').addEventListener('click', () => fechar(false));
            backdrop.querySelector('[data-acao="confirmar"]').addEventListener('click', () => fechar(true));
        });
    };

    window.definirCarregando = function (botao, carregando, textoCarregando = 'Salvando...') {
        if (carregando) {
            botao.dataset.textoOriginal = botao.textContent;
            botao.textContent = textoCarregando;
            botao.disabled = true;
            botao.classList.add('is-loading');
        } else {
            botao.textContent = botao.dataset.textoOriginal || botao.textContent;
            botao.disabled = false;
            botao.classList.remove('is-loading');
        }
    };
})();