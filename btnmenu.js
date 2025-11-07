const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// Abrir/fechar menu ao clicar no hamburger
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
});

// Fechar menu ao clicar em um link
const menuLinks = document.querySelectorAll('#navMenu a');
menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
  });
});

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
  if (
    !navMenu.contains(e.target) &&
    !hamburger.contains(e.target) &&
    navMenu.classList.contains('open')
  ) {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
  }
});
