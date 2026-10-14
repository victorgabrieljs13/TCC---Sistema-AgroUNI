function getToken() { return localStorage.getItem('token'); }

function getFeiranteLogado() {
    const dados = localStorage.getItem('feirante');
    return dados ? JSON.parse(dados) : null;
}

function fazerLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('feirante');
    window.location.href = 'login.html';
}

function protegerPagina() {
    if (!getToken()) window.location.href = 'login.html';
}

const formLogin = document.getElementById('form-login');
const mensagemErroLogin = document.getElementById('mensagem-erro');
const btnEntrar = document.getElementById('btn-entrar');

// Feedback rápido quando o usuário acabou de criar a conta.
const parametrosLogin = new URLSearchParams(window.location.search);
if (parametrosLogin.get('cadastro') === 'sucesso') {
    const sucessoCadastro = document.getElementById('mensagem-erro');
    if (sucessoCadastro) {
        sucessoCadastro.textContent = 'Cadastro realizado! Entre com o email e a senha que você acabou de criar.';
        sucessoCadastro.style.display = 'block';
        sucessoCadastro.style.background = 'var(--verde-tint)';
        sucessoCadastro.style.borderColor = '#bfe0c5';
        sucessoCadastro.style.color = 'var(--verde-escuro)';
    }
}

if (formLogin) {
    formLogin.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        mensagemErroLogin.style.display = 'none';
        definirCarregando(btnEntrar, true, 'Entrando...');

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
                definirCarregando(btnEntrar, false);
                return;
            }

            localStorage.setItem('token', dados.token);
            localStorage.setItem('feirante', JSON.stringify(dados.feirante));
            window.location.href = 'produtos.html';

        } catch (erro) {
            console.error(erro);
            toast('Não foi possível conectar ao servidor. Tente novamente.', 'erro');
            definirCarregando(btnEntrar, false);
        }
    });
}

document.querySelectorAll('.password-toggle').forEach((botao) => {
    botao.addEventListener('click', () => {
        const alvo = document.getElementById(botao.dataset.target);
        if (!alvo) return;
        const exibindo = alvo.type === 'text';
        alvo.type = exibindo ? 'password' : 'text';
        botao.textContent = exibindo ? 'Mostrar' : 'Ocultar';
        botao.setAttribute('aria-label', exibindo ? 'Mostrar senha' : 'Ocultar senha');
    });
});
