(() => {

// --------------------------------------------------
// META
// --------------------------------------------------

fetch("./app/meta.json")
    .then(r => r.json())
    .then(meta => {
        document.getElementById("meta-version").textContent = `v${meta.version} // ${meta.date}`;
        document.getElementById("meta-github").href    = meta.github;
        document.getElementById("meta-changelog").href = meta.changelog;
        document.getElementById("meta-issues").href    = meta.issues;
    });

// --------------------------------------------------
// DISPLAY — CRT toggle
// --------------------------------------------------

const crtToggle = document.getElementById("toggleCrt");
crtToggle.checked = localStorage.getItem("crt") !== "0";
crtToggle.addEventListener("change", () => {
    if (window.setCrt) setCrt(crtToggle.checked);
});

// --------------------------------------------------
// WALL OF MARTYRS — export / import everything
// --------------------------------------------------

const ALL_KEYS = ["liberationStatus", "theme", "showTitle", "cardSize", "crt", "announcement_seen"];

document.getElementById("exportData").addEventListener("click", () => {
    const data = {};
    ALL_KEYS.forEach(k => {
        const v = localStorage.getItem(k);
        if (v !== null) {
            // liberationStatus is JSON — parse it so the export is readable
            data[k] = k === "liberationStatus" ? JSON.parse(v) : v;
        }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = "warbond-tracker.json";
    a.click();
    URL.revokeObjectURL(url);
});

const importFile = document.getElementById("importFile");
document.getElementById("importData").addEventListener("click", () => importFile.click());
importFile.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        try {
            const data = JSON.parse(ev.target.result);
            if (data.liberationStatus) {
                localStorage.setItem("liberationStatus", JSON.stringify(data.liberationStatus));
            }
            if (data.theme && window.applyTheme)    applyTheme(data.theme);
            if (data.showTitle  != null)             localStorage.setItem("showTitle",  data.showTitle);
            if (data.cardSize   != null)             localStorage.setItem("cardSize",   data.cardSize);
            if (data.crt        != null) {
                localStorage.setItem("crt", data.crt);
                if (window.setCrt) setCrt(data.crt !== "0");
                crtToggle.checked = data.crt !== "0";
            }
            if (data.announcement_seen != null) {
                localStorage.setItem("announcement_seen", data.announcement_seen);
            }
            alert("Import successful.");
        } catch {
            alert("Invalid file.");
        }
    };
    reader.readAsText(file);
    importFile.value = "";
});

// --------------------------------------------------
// ENEMY ARTILLERY — clear buttons
// --------------------------------------------------

document.getElementById("clearLiberation").addEventListener("click", () => {
    if (!confirm("Clear all liberation progress?\nAre you sure?")) return;
    localStorage.removeItem("liberationStatus");
});

document.getElementById("clearStorage").addEventListener("click", () => {
    if (!confirm("Wipe ALL saved data?\nAre you sure?")) return;
    localStorage.clear();
    if (window.applyTheme) applyTheme("helldivers");
    if (window.setCrt)     setCrt(true);
    crtToggle.checked = true;
});

// --------------------------------------------------
// GENERIC MODAL HELPER
// --------------------------------------------------

function showModal({ tag, title, content }) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const panel = document.createElement("div");
    panel.className = "modal-panel";

    const tagEl = document.createElement("div");
    tagEl.className = "modal-tag";
    tagEl.textContent = tag;

    const body = document.createElement("div");
    body.className = "modal-body";

    if (title) {
        const titleEl = document.createElement("h2");
        titleEl.className = "modal-title";
        titleEl.textContent = title;
        body.appendChild(titleEl);
    }

    body.appendChild(content);

    const closeBtn = document.createElement("button");
    closeBtn.className = "modal-close";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => overlay.remove());
    body.appendChild(closeBtn);

    panel.append(tagEl, body);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
}

// --------------------------------------------------
// INTEL — View Aliases
// --------------------------------------------------

document.getElementById("viewAliases").addEventListener("click", async () => {
    let warbonds;
    try {
        warbonds = await fetch("./app/warbonds.json").then(r => r.json());
    } catch {
        alert("Could not load warbond data.");
        return;
    }

    const table = document.createElement("table");
    table.className = "aliases-table";

    warbonds.forEach(w => {
        const tr    = document.createElement("tr");
        const tdName = document.createElement("td");
        tdName.textContent = w.title;
        const tdAliases = document.createElement("td");
        tdAliases.textContent = (w.aliases || []).join(", ") || "—";
        tr.append(tdName, tdAliases);
        table.appendChild(tr);
    });

    showModal({ tag: "Intel", title: "Warbond Aliases", content: table });
});

// --------------------------------------------------
// INTEL — View Profile
// --------------------------------------------------

document.getElementById("viewProfile").addEventListener("click", () => {
    const liberation = JSON.parse(localStorage.getItem("liberationStatus") || "{}");
    const values     = Object.values(liberation);
    const liberated  = values.filter(s => s === "liberated").length;
    const liberating = values.filter(s => s === "liberating").length;

    const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";

    function section(heading, rows) {
        const wrap = document.createElement("div");
        wrap.className = "profile-section";
        const h = document.createElement("div");
        h.className = "profile-section-title";
        h.textContent = heading;
        wrap.appendChild(h);
        rows.forEach(([label, value]) => {
            const row = document.createElement("div");
            row.className = "profile-row";
            const l = document.createElement("span"); l.textContent = label;
            const v = document.createElement("span"); v.textContent = value;
            row.append(l, v);
            wrap.appendChild(row);
        });
        return wrap;
    }

    const container = document.createElement("div");
    container.appendChild(section("Liberation", [
        ["Liberated",  liberated],
        ["Liberating", liberating],
    ]));
    container.appendChild(section("Settings", [
        ["Theme",      cap(localStorage.getItem("theme") || "helldivers")],
        ["Show Title", localStorage.getItem("showTitle") === "true" ? "On" : "Off"],
        ["Card Size",  cap(localStorage.getItem("cardSize") || "medium")],
        ["CRT Effect", localStorage.getItem("crt") !== "0" ? "On" : "Off"],
    ]));
    container.appendChild(section("Announcements", [
        ["Last Seen", localStorage.getItem("announcement_seen") || "—"],
    ]));

    showModal({ tag: "Intel", title: "Profile", content: container });
});

})();