const barra = document.getElementById('barraProgresso');

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;                  // quanto rolou
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // altura total rolável
    const scrollPercent = (scrollTop / docHeight) * 100; // porcentagem
    barra.style.width = scrollPercent + "%";          // atualiza barra
});
