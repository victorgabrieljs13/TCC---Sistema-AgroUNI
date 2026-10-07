// ============================================================================
// CONSUMIDOR — autenticação e sessão
// Espelha o padrão de auth.js (produtor), mas pra conta de consumidor,
// com chaves próprias no localStorage pra não colidir com a sessão do
// produtor caso as duas acabem abertas no mesmo navegador.
// ============================================================================

function getTokenConsumidor() {
    return localStorage.getItem('tokenConsumidor');
}

function getConsumidorLogado() {
    const dados = localStorage.getItem('consumidor');
    return dados ? JSON.parse(dados) : null;
}

function fazerLogoutConsumidor() {
    localStorage.removeItem('tokenConsumidor');
    localStorage.removeItem('consumidor');
    window.location.href = 'vitrine.html';
}

function mostrarErroConsumidor(mensagem) {
    const el = document.getElementById('mensagem-erro');
    if (el) {
        el.textContent = mensagem;
        el.style.display = 'block';
    }
}

function salvarSessaoConsumidor(dados) {
    localStorage.setItem('tokenConsumidor', dados.token);
    localStorage.setItem('consumidor', JSON.stringify(dados.consumidor));
}

// ---------------------------------------------------------------------------
// Formulário de cadastro (só roda se a página tiver #form-cadastro-consumidor)
// ---------------------------------------------------------------------------

const formCadastroConsumidor = document.getElementById('form-cadastro-consumidor');

if (formCadastroConsumidor) {
    formCadastroConsumidor.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;
        const telefone = document.getElementById('telefone').value.replace(/\D/g, '');

        const botao = document.getElementById('btn-cadastrar');
        botao.disabled = true;
        botao.textContent = 'Criando conta…';

        try {
            const resposta = await fetch(`${API_URL}/consumidores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha, telefone }),
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                mostrarErroConsumidor(dados.mensagem);
                botao.disabled = false;
                botao.textContent = 'Criar conta';
                return;
            }

            // loga automaticamente logo após o cadastro
            const respostaLogin = await fetch(`${API_URL}/consumidores/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            });
            const dadosLogin = await respostaLogin.json();

            if (!respostaLogin.ok) {
                // cadastrou mas o login automático falhou — manda pra tela de login normal
                window.location.href = 'login-consumidor.html';
                return;
            }

            salvarSessaoConsumidor(dadosLogin);
            window.location.href = 'vitrine.html';

        } catch (erro) {
            console.error(erro);
            mostrarErroConsumidor('Não foi possível conectar ao servidor.');
            botao.disabled = false;
            botao.textContent = 'Criar conta';
        }
    });
}

// ---------------------------------------------------------------------------
// Formulário de login (só roda se a página tiver #form-login-consumidor)
// ---------------------------------------------------------------------------

const formLoginConsumidor = document.getElementById('form-login-consumidor');

if (formLoginConsumidor) {
    formLoginConsumidor.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;

        const botao = document.getElementById('btn-entrar');
        botao.disabled = true;
        botao.textContent = 'Entrando…';

        try {
            const resposta = await fetch(`${API_URL}/consumidores/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                mostrarErroConsumidor(dados.mensagem);
                botao.disabled = false;
                botao.textContent = 'Entrar';
                return;
            }

            salvarSessaoConsumidor(dados);
            window.location.href = 'vitrine.html';

        } catch (erro) {
            console.error(erro);
            mostrarErroConsumidor('Não foi possível conectar ao servidor.');
            botao.disabled = false;
            botao.textContent = 'Entrar';
        }
    });
}
