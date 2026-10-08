(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const tipo = params.get('tipo') === 'consumidor' ? 'consumidor' : 'feirante';
    const endpointBase = tipo === 'consumidor' ? '/consumidores' : '/auth';
    const ehRecuperacao = !!document.getElementById('form-recuperar-senha');

    const eyebrow = document.getElementById('password-eyebrow');
    const linkLogin = document.getElementById('link-login');
    const linkTrocarPerfil = document.getElementById('link-trocar-perfil');

    if (eyebrow) {
        eyebrow.textContent = tipo === 'consumidor' ? 'ACESSO DO CONSUMIDOR' : 'ACESSO DO FEIRANTE';
    }

    if (linkLogin) {
        linkLogin.href = tipo === 'consumidor' ? 'login-consumidor.html' : 'login.html';
    }

    if (linkTrocarPerfil) {
        linkTrocarPerfil.href = tipo === 'consumidor'
            ? 'login.html'
            : 'login-consumidor.html';
        linkTrocarPerfil.textContent = tipo === 'consumidor'
            ? 'Entrar como feirante'
            : 'Entrar como consumidor';
    }

    function mostrarMensagem(id, mensagem) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = mensagem;
        el.style.display = 'block';
    }

    function limparMensagens() {
        ['mensagem-erro', 'mensagem-sucesso'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = '';
                el.style.display = 'none';
            }
        });
    }

    if (ehRecuperacao) {
        const form = document.getElementById('form-recuperar-senha');
        const botao = document.getElementById('btn-recuperar');

        form.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            limparMensagens();

            const email = document.getElementById('email').value.trim();
            botao.disabled = true;
            botao.textContent = 'Enviando…';

            try {
                const resposta = await fetch(`${API_URL}${endpointBase}/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const dados = await resposta.json();

                if (!resposta.ok) {
                    mostrarMensagem('mensagem-erro', dados.mensagem || 'Não foi possível solicitar a recuperação.');
                    return;
                }

                mostrarMensagem('mensagem-sucesso', dados.mensagem);
                form.reset();
            } catch (erro) {
                console.error(erro);
                mostrarMensagem('mensagem-erro', 'Não foi possível conectar ao servidor. Tente novamente.');
            } finally {
                botao.disabled = false;
                botao.textContent = 'Enviar link de recuperação';
            }
        });
        return;
    }

    const token = params.get('token');
    const campoToken = document.getElementById('token');
    const campoTipo = document.getElementById('tipo');
    const form = document.getElementById('form-redefinir-senha');
    const botao = document.getElementById('btn-redefinir');

    if (campoToken) campoToken.value = token || '';
    if (campoTipo) campoTipo.value = tipo;

    if (!token) {
        mostrarMensagem('mensagem-erro', 'O link de recuperação está incompleto. Solicite um novo link para continuar.');
        if (form) form.style.display = 'none';
        return;
    }

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        limparMensagens();

        const novaSenha = document.getElementById('nova-senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;

        if (novaSenha.length < 6) {
            mostrarMensagem('mensagem-erro', 'A nova senha precisa ter pelo menos 6 caracteres.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            mostrarMensagem('mensagem-erro', 'As senhas não coincidem.');
            return;
        }

        botao.disabled = true;
        botao.textContent = 'Salvando…';

        try {
            const resposta = await fetch(`${window.location.origin}${endpointBase}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, novaSenha })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                mostrarMensagem('mensagem-erro', dados.mensagem || 'Não foi possível alterar a senha.');
                return;
            }

            mostrarMensagem('mensagem-sucesso', dados.mensagem);
            form.reset();
            form.style.display = 'none';

            setTimeout(() => {
                window.location.href = tipo === 'consumidor' ? 'login-consumidor.html' : 'login.html';
            }, 1800);
        } catch (erro) {
            console.error(erro);
            mostrarMensagem('mensagem-erro', 'Não foi possível conectar ao servidor. Tente novamente.');
        } finally {
            botao.disabled = false;
            botao.textContent = 'Salvar nova senha';
        }
    });
})();
