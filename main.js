/* ================================================================
ARQUIVO: main.js
ORGANIZAÇÃO: Menu, Botão Topo, Progresso, Scroll Suave e Form
================================================================
*/

// --- 1. MENU HAMBURGER (btnmenu.js) ---
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    const menuLinks = document.querySelectorAll('#navMenu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('open')) {
            hamburger.classList.remove('open');
            navMenu.classList.remove('open');
        }
    });
}

// --- 2. BOTÃO VOLTAR AO TOPO E BARRA DE PROGRESSO (btn-topo.js & loadbar.js) ---
const btnTopo = document.getElementById('btnTopo');
const barra = document.getElementById('barraProgresso');

window.addEventListener('scroll', () => {
    // Lógica do Botão Topo
    if (btnTopo) {
        if (window.scrollY > 300) {
            btnTopo.classList.add('show');
        } else {
            btnTopo.classList.remove('show');
        }
    }

    // Lógica da Barra de Progresso
    if (barra) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        barra.style.width = scrollPercent + "%";
    }
});

if (btnTopo) {
    btnTopo.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// --- 3. SCROLL SUAVE PARA LINKS INTERNOS (hash.js) ---
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// --- 4. FORMULÁRIO, TOAST E EMAILJS (forms.js) ---
function showToastModal(message, type = "success", options = {}) {
    const timeout = typeof options.timeout === "number" ? options.timeout : 3800;
    if (document.querySelector('.toast-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'toast-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-live', 'polite');

    const modal = document.createElement('div');
    modal.className = `toast-modal ${type}`;

    const icon = document.createElement('div');
    icon.className = 'icon';
    icon.textContent = type === 'success' ? '✅' : '⚠️';

    const txt = document.createElement('div');
    txt.className = 'text';
    txt.textContent = message;

    modal.append(icon, txt);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        modal.style.animation = 'toastModalOut 320ms ease forwards';
        overlay.style.transition = 'opacity 260ms ease';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = prevOverflow || '';
        }, 340);
    }, timeout);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contato-form');
    if (!form) return;

    const celularInput = document.getElementById('celular');
    const inputs = form.querySelectorAll('input, textarea');

    const SERVICE_ID = "service_b2axn2b";
    const TEMPLATE_ID_INTERNO = "template_ob2bkzq";
    const TEMPLATE_ID_AUTO = "template_d7gjgtm";
    const PUBLIC_KEY = "pRo5I-cbHDqNgyPhl";
    const REPLY_TO_EMAIL = "lucaspedrodesouza15@gmail.com";

    if (typeof emailjs !== 'undefined' && emailjs.init) {
        emailjs.init(PUBLIC_KEY);
    }

    // Máscara de Celular
    if (celularInput) {
        let lastValue = "";
        celularInput.addEventListener('input', (e) => {
            let numeros = e.target.value.replace(/\D/g, '');
            if (numeros.length > 11) numeros = numeros.slice(0, 11);
            let formatado = numeros;
            if (numeros.length > 6) formatado = numeros.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
            else if (numeros.length > 2) formatado = numeros.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
            else if (numeros.length > 0) formatado = numeros.replace(/^(\d{0,2})/, '($1');

            if (formatado !== lastValue) {
                e.target.value = formatado;
                lastValue = formatado;
            }
            validateField(e.target);
        });
    }

    // Validação
    const validators = {
        nome: (v) => v.trim().length >= 3,
        email: (v) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v),
        celular: (v) => v.replace(/\D/g, '').length === 11,
        mensagem: (v) => v.trim().length >= 10
    };

    function validateField(input) {
        if (!input || !input.name) return true;
        const valid = validators[input.name] ? validators[input.name](input.value) : true;
        const feedback = input.parentElement.querySelector('.input-feedback');

        if (valid) {
            input.classList.replace('invalid', 'valid') || input.classList.add('valid');
            if (feedback) feedback.textContent = '✔️ Tudo certo!';
        } else {
            input.classList.replace('valid', 'invalid') || input.classList.add('invalid');
            if (feedback) feedback.textContent = 'Campo inválido.';
        }
        return valid;
    }

    inputs.forEach(input => {
        input.addEventListener('input', () => validateField(input));
        input.addEventListener('blur', () => validateField(input));
    });

    // Envio
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let allValid = true;
        inputs.forEach(inp => { if (!validateField(inp)) allValid = false; });

        if (!allValid) {
            showToastModal('Verifique os campos e tente novamente.', 'error');
            return;
        }

        const loader = document.createElement('div');
        loader.className = 'form-loader-overlay';
        loader.innerHTML = '<div class="form-loader"><p>Enviando...</p></div>';
        document.body.appendChild(loader);

        try {
            const payload = { 
                nome: form.nome.value, 
                email: form.email.value, 
                celular: form.celular.value, 
                mensagem: form.mensagem.value 
            };
            await emailjs.send(SERVICE_ID, TEMPLATE_ID_INTERNO, payload);
            await emailjs.send(SERVICE_ID, TEMPLATE_ID_AUTO, { ...payload, reply_to: REPLY_TO_EMAIL });

            showToastModal('Mensagem enviada com sucesso!', 'success');
            form.reset();
            inputs.forEach(i => i.classList.remove('valid', 'invalid'));
        } catch (error) {
            showToastModal('Falha ao enviar.', 'error');
        } finally {
            loader.remove();
        }
    });

    //Revelação
    const observerOptions = {
        threshold: 0.15 
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Adiciona um pequeno delay para os cards aparecerem um após o outro
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, index * 100); 
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Seleciona o que deve "nascer" suavemente
    const elementsToReveal = document.querySelectorAll('.sobre, servicos, .avaliacoes, .contato, .card:not(.hero .card), h2:not(.hero h2)');

    elementsToReveal.forEach((el) => {
        el.classList.add('reveal'); // Garante que comecem invisíveis
        revealOnScroll.observe(el);
    });
});
