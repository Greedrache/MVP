const menuToggle = document.getElementById('menu-toggle');
const headerLinks = document.getElementById('headerlinks');

menuToggle.addEventListener('click', () => {
    headerLinks.classList.toggle('active');
});

menuToggle.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') menuToggle.click();
});

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("success") === "1") {
    const popup = document.getElementById("successPopup");
    popup.style.display = "block";
    setTimeout(() => {
        popup.style.opacity = "0";
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}
