(() => {

const savedTheme = localStorage.getItem("theme") || "helldivers";
applyTheme(savedTheme);

document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
});

})();