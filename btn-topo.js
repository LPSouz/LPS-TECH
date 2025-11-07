const btnTopo = document.getElementById('btnTopo');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        btnTopo.classList.add('show');
    } else {
        btnTopo.classList.remove('show');
    }
});

btnTopo.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});