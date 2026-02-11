const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("success") === "1") {
    const popup = document.getElementById("successPopup");
    popup.style.display = "block";
    setTimeout(() => {
        popup.style.opacity = "0";
        setTimeout(() => popup.remove(), 500);
    }, 3000); 
}
