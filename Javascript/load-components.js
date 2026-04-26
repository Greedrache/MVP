document.addEventListener('DOMContentLoaded', () => {
    fetch('includes/header.html')
        .then(response => response.text())
        .then(data => {
            const header = document.querySelector('header');
            if (header) {
                header.innerHTML = data;
                const menuToggle = document.getElementById('menu-toggle');
                const nav = document.getElementById('headerlinks');
                if (menuToggle && nav) {
                    menuToggle.addEventListener('click', () => {
                        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
                        menuToggle.setAttribute('aria-expanded', !expanded);
                        menuToggle.classList.toggle('active');
                        nav.classList.toggle('active');
                    });
                }
            }
        });

    fetch('includes/footer.html')
        .then(response => response.text())
        .then(data => {
            const footer = document.querySelector('footer');
            if (footer) footer.innerHTML = data;
        });
});