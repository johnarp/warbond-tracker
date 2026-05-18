// Apply theme on every load, not just when visiting styles.html.
// Theme colour for the mobile nav bar is read directly from the CSS variable
// so there's no parallel THEME_COLORS map to maintain alongside styles.css.
window.applyTheme = function(theme) {
    // Migrate legacy "oled-*" theme values saved before OLED became a global toggle
    if (theme.startsWith("oled-")) theme = theme.slice(5);
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

// OLED toggle — overrides background colours to pure black on any theme.
// Global so settings.js can call it.
window.setOled = function(enabled) {
    document.documentElement.classList.toggle("oled", enabled);
    localStorage.setItem("oled", enabled ? "1" : "0");

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.content = enabled ? "#000000" : getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || "#ffe900";
    }
};

// BACKDROP toggle — adds dark backing and blur to UI elements that float
// over background images, improving readability on Super Style themes.
// Global so settings.js can call it.
window.setBackdrop = function(enabled) {
    document.documentElement.classList.toggle("backdrop", enabled);
    localStorage.setItem("backdrop", enabled ? "1" : "0");
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

// --------------------------------------------------
// CONFIRM DIALOG
// Replaces native confirm(). Shows a message with
// Confirm and Cancel buttons. onConfirm fires only
// if the user presses Confirm. Backdrop click = cancel.
//
// Options:
//   tag       {string}   - tag bar label
//   message   {string}   - body message text
//   confirmLabel {string} - confirm button text (default "Confirm")
//   onConfirm {Function} - callback fired on confirmation
// --------------------------------------------------
window.showConfirm = function({ tag = "Confirm", message, confirmLabel = "Confirm", onConfirm } = {}) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const panel = document.createElement("div");
    panel.className = "modal-panel";

    const tagEl = document.createElement("div");
    tagEl.className   = "modal-tag";
    tagEl.textContent = tag;
    panel.appendChild(tagEl);

    const body = document.createElement("div");
    body.className = "modal-body";

    const msg = document.createElement("p");
    msg.className   = "modal-message";
    msg.textContent = message;
    body.appendChild(msg);

    const btnRow = document.createElement("div");
    btnRow.className = "modal-btn-row";

    const cancelBtn = document.createElement("button");
    cancelBtn.className   = "modal-cancel";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => overlay.remove());

    const confirmBtn = document.createElement("button");
    confirmBtn.className   = "modal-confirm";
    confirmBtn.textContent = confirmLabel;
    confirmBtn.addEventListener("click", () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    });

    btnRow.append(cancelBtn, confirmBtn);
    body.appendChild(btnRow);
    panel.appendChild(body);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
};

// --------------------------------------------------
// NOTICE DIALOG
// Replaces native alert(). A single-button info modal.
//
// Options:
//   tag     {string} - tag bar label
//   message {string} - body message text
//   label   {string} - button text (default "OK")
// --------------------------------------------------
window.showNotice = function({ tag = "Notice", message, label = "OK" } = {}) {
    const p = document.createElement("p");
    p.className   = "modal-message";
    p.textContent = message;
    window.showModal({ tag, content: p, closeLabel: label });
};

applyTheme(localStorage.getItem("theme") || "helldivers");
setCrt(localStorage.getItem("crt")         === "1"); // default: off
setOled(localStorage.getItem("oled")       === "1"); // default: off
setBackdrop(localStorage.getItem("backdrop") === "1"); // default: off

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