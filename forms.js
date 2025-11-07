// ===============================
// TOAST MODAL
// ===============================
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

// ===============================
// FORM + EMAILJS + LOADER + FEEDBACK VISUAL
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contato-form');
  if (!form) return;

  const celularInput = document.getElementById('celular');
  const inputs = form.querySelectorAll('input, textarea');

  // ===============================
  // EMAILJS CONFIG
  // ===============================
  const SERVICE_ID = "service_b2axn2b";
  const TEMPLATE_ID_INTERNO = "template_ob2bkzq";
  const TEMPLATE_ID_AUTO = "template_d7gjgtm";
  const PUBLIC_KEY = "pRo5I-cbHDqNgyPhl";
  const REPLY_TO_EMAIL = "lucaspedrodesouza15@gmail.com";

  if (typeof emailjs !== 'undefined' && emailjs.init) {
    emailjs.init(PUBLIC_KEY);
  }

  // ===============================
  // MÁSCARA CELULAR REFINADA
  // ===============================
  if (celularInput) {
    let lastValue = "";

    celularInput.addEventListener('beforeinput', (e) => {
      if (e.inputType === 'insertText' && /\D/.test(e.data)) e.preventDefault();
    });

    celularInput.addEventListener('input', (e) => {
      let numeros = e.target.value.replace(/\D/g, '');
      if (numeros.length > 11) numeros = numeros.slice(0, 11);

      let formatado = numeros;
      if (numeros.length > 6) {
        formatado = numeros.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
      } else if (numeros.length > 2) {
        formatado = numeros.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      } else if (numeros.length > 0) {
        formatado = numeros.replace(/^(\d{0,2})/, '($1');
      }

      if (formatado !== lastValue) {
        e.target.value = formatado;
        e.target.setSelectionRange(e.target.value.length, e.target.value.length);
        lastValue = formatado;
      }

      validateField(e.target); // valida em tempo real
    });
  }

  // ===============================
  // VALIDAÇÃO AO VIVO
  // ===============================
  const validators = {
    nome: (v) => v.trim().length >= 3,
    email: (v) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v),
    celular: (v) => {
      const n = v.replace(/\D/g, '');
      return n.length === 11; // força DDD + número
    },
    mensagem: (v) => v.trim().length >= 10
  };

  const feedbackMessages = {
    nome: "Digite pelo menos 3 caracteres.",
    email: "Digite um e-mail válido.",
    celular: "Digite um número válido (DDD + número).",
    mensagem: "A mensagem deve ter pelo menos 10 caracteres."
  };

  function validateField(input) {
    if (!input || !input.name) return true;

    const name = input.name;
    const value = input.value || '';
    const valid = validators[name] ? validators[name](value) : true;
    const feedback = input.parentElement.querySelector('.input-feedback');

    if (valid) {
      input.classList.remove('invalid');
      input.classList.add('valid');
      if (feedback) {
        feedback.textContent = '✔️ Tudo certo!';
        feedback.style.color = 'var(--accent-hover)';
      }
    } else {
      input.classList.remove('valid');
      input.classList.add('invalid');
      if (feedback) {
        feedback.textContent = feedbackMessages[name] || 'Campo inválido.';
        feedback.style.color = 'var(--error)';
      }
    }

    return valid;
  }

  // ativa validação ao digitar e sair do campo
  inputs.forEach((input) => {
    if (!input.hasAttribute('placeholder')) input.setAttribute('placeholder', ' ');
    input.addEventListener('input', () => validateField(input));
    input.addEventListener('blur', () => validateField(input));
  });

  // ===============================
  // ENVIO DO FORM
  // ===============================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const celular = form.celular.value.trim();
    const mensagem = form.mensagem.value.trim();

    let allValid = true;
    inputs.forEach((inp) => {
      const ok = validateField(inp);
      if (!ok) allValid = false;
    });

    if (!allValid) {
      showToastModal('Verifique os campos e tente novamente.', 'error');
      return;
    }

    const loader = document.createElement('div');
    loader.className = 'form-loader-overlay';
    loader.innerHTML = `
      <div class="form-loader">
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" stroke="var(--accent)" stroke-width="4" fill="none" stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate" dur="1s" from="0 25 25" to="360 25 25" repeatCount="indefinite" />
          </circle>
        </svg>
        <p>Enviando sua mensagem...</p>
      </div>
    `;
    document.body.appendChild(loader);

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID_INTERNO, { nome, email, celular, mensagem });
      await emailjs.send(SERVICE_ID, TEMPLATE_ID_AUTO, { nome, email, celular, mensagem, reply_to: REPLY_TO_EMAIL });

      showToastModal('Mensagem enviada com sucesso!', 'success', { timeout: 3000 });
      form.reset();
      inputs.forEach((i) => {
        i.classList.remove('valid', 'invalid');
        const fb = i.parentElement.querySelector('.input-feedback');
        if (fb) fb.textContent = '';
      });
    } catch (error) {
      console.error(error);
      showToastModal('Falha ao enviar. Tente novamente mais tarde.', 'error');
    } finally {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 400);
    }
  });

  // ===============================
  // FEEDBACK VISUAL AVANÇADO
  // ===============================
  inputs.forEach((input) => {
    const feedback = input.parentElement.querySelector('.input-feedback');
    input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
    input.addEventListener('blur', () => input.parentElement.classList.remove('focused'));

    input.addEventListener('input', () => {
      if (input.classList.contains('valid')) {
        input.parentElement.classList.add('pulse-valid');
        setTimeout(() => input.parentElement.classList.remove('pulse-valid'), 600);
      }
    });

    if (feedback) {
      feedback.style.opacity = feedback.textContent ? '1' : '0';
      const observer = new MutationObserver(() => {
        feedback.style.transition = 'opacity 0.25s ease';
        feedback.style.opacity = feedback.textContent ? '1' : '0';
      });
      observer.observe(feedback, { childList: true, characterData: true, subtree: true });
    }
  });
});
