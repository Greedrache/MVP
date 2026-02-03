const menuToggle = document.getElementById('menu-toggle');
const headerLinks = document.getElementById('headerlinks');

menuToggle.addEventListener('click', () => {
    headerLinks.classList.toggle('active');
});
