// apply theme every load, not just when visit styles.html
window.applyTheme = function(theme) {
    if (theme === "classic-yellow") {
        document.documentElement.removeAttribute("data-theme");
    } else {
        document.documentElement.setAttribute("data-theme", theme);
    }
    localStorage.setItem("theme", theme);
    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.theme === theme);
    });
}
applyTheme(localStorage.getItem("theme") || "classic-yellow");

// index.html div thats filled by a view
const content = document.getElementById("content");
// index.html nav bar links
const links = document.querySelectorAll("nav a");

async function loadView(viewPath) {
    content.innerHTML = await (await fetch(viewPath)).text();

    // views/warbonds.html → app/warbonds.js
    const scriptName = viewPath.split("/").pop().replace(".html", ".js");
    const scriptSrc = `app/${scriptName}`;

    const old = document.getElementById("view-script");
    if (old) old.remove();

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.id = "view-script";
    document.body.appendChild(script);
}

links.forEach(link => {
    link.addEventListener("click", async (e) => {
        e.preventDefault();
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        loadView(link.dataset.view);
    });
});

// warbond default view
document.querySelector('[data-view="views/warbonds.html"]').classList.add('active');
loadView("views/warbonds.html");