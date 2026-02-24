(() => {

const savedTheme = localStorage.getItem("theme") || "default";
applyTheme(savedTheme);

document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
});

})();