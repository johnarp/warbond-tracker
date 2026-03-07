// Apply theme on every load, not just when visiting styles.html
window.applyTheme = function(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.theme === theme);
    });
};
applyTheme(localStorage.getItem("theme") || "helldivers");

// Load announcement popup globally (not tied to any view)
const annScript = document.createElement("script");
annScript.src = "./app/announcement.js";
document.body.appendChild(annScript);

// View container and nav links
const content = document.getElementById("content");
const links   = document.querySelectorAll("nav a");

async function loadView(viewPath) {
    content.innerHTML = await (await fetch(viewPath)).text();

    // views/warbonds.html → app/warbonds.js
    const scriptName = viewPath.split("/").pop().replace(".html", ".js");

    const old = document.getElementById("view-script");
    if (old) old.remove();

    const script = document.createElement("script");
    script.src = `app/${scriptName}`;
    script.id = "view-script";
    document.body.appendChild(script);
}

links.forEach(link => {
    link.addEventListener("click", async (e) => {
        e.preventDefault();
        links.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
        loadView(link.dataset.view);
    });
});

// Default view
document.querySelector('[data-view="views/warbonds.html"]').classList.add("active");
loadView("views/warbonds.html");