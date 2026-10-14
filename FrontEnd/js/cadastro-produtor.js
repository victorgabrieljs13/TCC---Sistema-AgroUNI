function mostrarMensagemCadastro(tipo, mensagem) {
    const erro = document.getElementById('mensagem-erro');
    const sucesso = document.getElementById('mensagem-sucesso');
    if (erro) { erro.textContent = ''; erro.style.display = 'none'; }
    if (sucesso) { sucesso.textContent = ''; sucesso.style.display = 'none'; }

    const alvo = tipo === 'erro' ? erro : sucesso;
    if (alvo) {
        alvo.textContent = mensagem;
        alvo.style.display = 'block';
    }
}

function somenteDigitos(valor) {
    return valor.replace(/\D/g, '');
}

function formatarDocumento(valor) {
    const d = somenteDigitos(valor).slice(0, 14);
    if (d.length <= 11) {
        return d
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return d
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function formatarTelefone(valor) {
    const d = somenteDigitos(valor).slice(0, 11);
    if (d.length <= 10) {
        return d
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return d
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
}

const formCadastroProdutor = document.getElementById('form-cadastro-produtor');

const documentoInput = document.getElementById('cpf_cnpj');
if (documentoInput) {
    documentoInput.addEventListener('input', () => { documentoInput.value = formatarDocumento(documentoInput.value); });
}

const telefoneInput = document.getElementById('telefone');
if (telefoneInput) {
    telefoneInput.addEventListener('input', () => { telefoneInput.value = formatarTelefone(telefoneInput.value); });
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

if (formCadastroProdutor) {
    formCadastroProdutor.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const cpf_cnpj = somenteDigitos(document.getElementById('cpf_cnpj').value);
        const telefone = somenteDigitos(document.getElementById('telefone').value);
        const email = document.getElementById('email').value.trim().toLowerCase();
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;
        const box = document.getElementById('box').value.trim();
        const botao = document.getElementById('btn-cadastrar-produtor');

        if (nome.length < 3) return mostrarMensagemCadastro('erro', 'Informe o nome do produtor ou responsável.');
        if (![11, 14].includes(cpf_cnpj.length)) return mostrarMensagemCadastro('erro', 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.');
        if (telefone.length < 10 || telefone.length > 11) return mostrarMensagemCadastro('erro', 'Informe um telefone com DDD.');
        if (!email || !email.includes('@')) return mostrarMensagemCadastro('erro', 'Informe um email válido.');
        if (senha.length < 6) return mostrarMensagemCadastro('erro', 'A senha precisa ter pelo menos 6 caracteres.');
        if (senha !== confirmarSenha) return mostrarMensagemCadastro('erro', 'As senhas não coincidem.');

        mostrarMensagemCadastro('erro', '');
        const erro = document.getElementById('mensagem-erro');
        if (erro) erro.style.display = 'none';
        botao.disabled = true;
        botao.textContent = 'Criando conta…';

        try {
            const resposta = await fetch(`${API_URL}/feirantes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, cpf_cnpj, telefone, email, senha, box: box || null })
            });

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                mostrarMensagemCadastro('erro', dados.mensagem || 'Não foi possível concluir o cadastro.');
                botao.disabled = false;
                botao.textContent = 'Criar conta de produtor';
                return;
            }

            mostrarMensagemCadastro('sucesso', 'Cadastro realizado com sucesso! Redirecionando para o login…');
            formCadastroProdutor.reset();
            setTimeout(() => { window.location.href = 'login.html?cadastro=sucesso'; }, 1200);
        } catch (erro) {
            console.error(erro);
            mostrarMensagemCadastro('erro', 'Não foi possível conectar ao servidor. Tente novamente.');
            botao.disabled = false;
            botao.textContent = 'Criar conta de produtor';
        }
    });
}
