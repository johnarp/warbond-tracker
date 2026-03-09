// Apply theme on every load, not just when visiting styles.html.
// Theme colour for the mobile nav bar is read directly from the CSS variable
// so there's no parallel THEME_COLORS map to maintain alongside styles.css.
window.applyTheme = function(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.theme === theme);
    });
    // Read --color-primary from the applied theme rather than a hard-coded map
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        const color = getComputedStyle(document.documentElement)
            .getPropertyValue("--color-primary").trim();
        metaTheme.content = color || "#ffe900";
    }
};

// CRT scanline toggle — global so settings.js can call it
window.setCrt = function(enabled) {
    document.documentElement.classList.toggle("no-crt", !enabled);
    localStorage.setItem("crt", enabled ? "1" : "0");
};

// --------------------------------------------------
// SHARED MODAL
// Used by announcement.js, settings.js, and any
// future feature that needs a consistent modal.
//
// Options:
//   tag        {string}   - small label bar at the top
//   title      {string}   - optional heading inside the body
//   content    {Element}  - DOM node to insert as the body content
//   image      {string}   - optional image URL shown below the tag bar
//   closeLabel {string}   - close button text (default "Close")
//   onClose    {Function} - optional callback fired before the modal is removed
// --------------------------------------------------
window.showModal = function({ tag, title, content, image, closeLabel = "Close", onClose } = {}) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const panel = document.createElement("div");
    panel.className = "modal-panel";

    // Tag bar
    const tagEl = document.createElement("div");
    tagEl.className   = "modal-tag";
    tagEl.textContent = tag;
    panel.appendChild(tagEl);

    // Optional image (used by announcements)
    if (image) {
        const img = document.createElement("img");
        img.className = "modal-img";
        img.src = image;
        img.alt = title || "";
        panel.appendChild(img);
    }

    // Body
    const body = document.createElement("div");
    body.className = "modal-body";

    if (title) {
        const titleEl = document.createElement("h2");
        titleEl.className   = "modal-title";
        titleEl.textContent = title;
        body.appendChild(titleEl);
    }

    if (content) body.appendChild(content);

    const closeBtn = document.createElement("button");
    closeBtn.className   = "modal-close";
    closeBtn.textContent = closeLabel;

    function dismiss() {
        if (onClose) onClose();
        overlay.remove();
    }

    closeBtn.addEventListener("click", dismiss);
    body.appendChild(closeBtn);

    panel.appendChild(body);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Click backdrop to dismiss
    overlay.addEventListener("click", e => { if (e.target === overlay) dismiss(); });

    return overlay;
};

applyTheme(localStorage.getItem("theme") || "helldivers");
setCrt(localStorage.getItem("crt") !== "0"); // default: on

// --------------------------------------------------
// SCRIPT LOADING
// Shared helper used for both the announcement and
// per-view scripts. Passing an id allows the old
// script tag to be removed before adding the new one,
// preventing duplicate execution on view changes.
// --------------------------------------------------
function loadScript(src, id = null) {
    if (id) document.getElementById(id)?.remove();
    const script = document.createElement("script");
    script.src = src;
    if (id) script.id = id;
    document.body.appendChild(script);
}

// Load announcement popup globally (not tied to any view)
loadScript("./app/announcement.js");

// --------------------------------------------------
// VIEW ROUTER
// --------------------------------------------------
const content = document.getElementById("content");
const links   = document.querySelectorAll("nav a");

async function loadView(viewPath) {
    content.innerHTML = await (await fetch(viewPath)).text();
    // views/warbonds.html → app/warbonds.js
    const scriptName = viewPath.split("/").pop().replace(".html", ".js");
    loadScript(`app/${scriptName}`, "view-script");
}

links.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        links.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
        loadView(link.dataset.view);
    });
});

// Default view
document.querySelector('[data-view="views/warbonds.html"]').classList.add("active");
loadView("views/warbonds.html");