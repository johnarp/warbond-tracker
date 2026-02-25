(() => {

const savedTheme = localStorage.getItem("theme") || "classic-yellow";
applyTheme(savedTheme);

document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
});

})();