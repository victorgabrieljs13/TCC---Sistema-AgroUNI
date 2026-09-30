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
