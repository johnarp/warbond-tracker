const THEME_COLORS = {
    helldivers:    '#ffe900',
    terminids:     '#ffb900',
    automatons:    '#ff7171',
    illuminate:    '#cd8ae9',
    'oled-helldivers':   '#ffe900',
    'oled-terminids':   '#ffb900',
    'oled-automatons':   '#ff7171',
    'oled-illuminate':   '#cd8ae9',
    'super-earth': '#4da6ff',
    'meridian-black-hole': '#cd8ae9'
};

// Apply theme on every load, not just when visiting styles.html
window.applyTheme = function(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.theme === theme);
    });
    // Update mobile browser nav bar color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = THEME_COLORS[theme] || '#ffe900';
};

// CRT scanline toggle — global so settings.js can call it
window.setCrt = function(enabled) {
    document.documentElement.classList.toggle("no-crt", !enabled);
    localStorage.setItem("crt", enabled ? "1" : "0");
};

applyTheme(localStorage.getItem("theme") || "helldivers");
setCrt(localStorage.getItem("crt") !== "0"); // default: on

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