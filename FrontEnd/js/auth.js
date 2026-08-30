// Funções compartilhadas de autenticação, usadas em todas as páginas

function getToken() {
    return localStorage.getItem('token');
}

function getFeiranteLogado() {
    const dados = localStorage.getItem('feirante');
    return dados ? JSON.parse(dados) : null;
}

function fazerLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('feirante');
    window.location.href = 'index.html';
}

// Chama isso no topo de toda página protegida: se não tiver logado, manda pro login
function protegerPagina() {
    if (!getToken()) {
        window.location.href = 'index.html';
    }
}

// --- Lógica específica da tela de login (só roda se o formulário existir na página) ---
const formLogin = document.getElementById('form-login');
const mensagemErroLogin = document.getElementById('mensagem-erro');

if (formLogin) {
    formLogin.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        mensagemErroLogin.style.display = 'none';

        try {
            const resposta = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                mensagemErroLogin.textContent = dados.mensagem;
                mensagemErroLogin.style.display = 'block';
                return;
            }

            localStorage.setItem('token', dados.token);
            localStorage.setItem('feirante', JSON.stringify(dados.feirante));
            window.location.href = 'produtos.html';

        } catch (erro) {
            console.error(erro);
            mensagemErroLogin.textContent = 'Erro ao conectar com o servidor. Verifique se o back-end está rodando.';
            mensagemErroLogin.style.display = 'block';
        }
    });
}