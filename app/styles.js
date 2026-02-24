(() => {

window.applyTheme = function(theme) {
    if (theme === "default") {
        document.documentElement.removeAttribute("data-theme");
    } else {
        document.documentElement.setAttribute("data-theme", theme);
    }
    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.theme === theme);
    });
    localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme") || "default";
applyTheme(savedTheme);

document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
});

})();