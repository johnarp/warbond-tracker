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
crtToggle.checked = localStorage.getItem("crt") === "1";
crtToggle.addEventListener("change", () => {
    if (window.setCrt) setCrt(crtToggle.checked);
});

// --------------------------------------------------
// DISPLAY — OLED toggle
// --------------------------------------------------

const oledToggle = document.getElementById("toggleOled");
oledToggle.checked = localStorage.getItem("oled") === "1";
oledToggle.addEventListener("change", () => {
    if (window.setOled) setOled(oledToggle.checked);
});

// --------------------------------------------------
// DISPLAY — Backdrop toggle
// --------------------------------------------------

const backdropToggle = document.getElementById("toggleBackdrop");
backdropToggle.checked = localStorage.getItem("backdrop") === "1";
backdropToggle.addEventListener("change", () => {
    if (window.setBackdrop) setBackdrop(backdropToggle.checked);
});

// --------------------------------------------------
// DISPLAY — Short Titles toggle
// --------------------------------------------------

const shortTitleToggle = document.getElementById("toggleShortTitle");
shortTitleToggle.checked = localStorage.getItem("showShortTitle") === "true";
shortTitleToggle.addEventListener("change", () => {
    localStorage.setItem("showShortTitle", String(shortTitleToggle.checked));
});

// --------------------------------------------------
// WALL OF MARTYRS — export / import everything
// Keys that store JSON objects/arrays are listed in
// JSON_KEYS so the exporter parses them (making the
// file readable) and the importer re-stringifies them.
// --------------------------------------------------

const ALL_KEYS = [
    "liberationStatus", "medalsSpent",
    "theme", "showTitle", "showShortTitle", "showMedals",
    "cardSize", "sort", "view",
    "typeFilter", "libFilter",
    "crt", "oled", "backdrop",
    "announcement_seen",
];

// Keys whose localStorage values are JSON strings that
// should be parsed for export and re-stringified on import.
const JSON_KEYS = ["liberationStatus", "medalsSpent", "typeFilter", "libFilter"];

document.getElementById("exportData").addEventListener("click", () => {
    const data = {};
    ALL_KEYS.forEach(k => {
        const v = localStorage.getItem(k);
        if (v !== null) {
            data[k] = JSON_KEYS.includes(k) ? JSON.parse(v) : v;
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

            // — Liberation status —
            if (data.liberationStatus) {
                localStorage.setItem("liberationStatus", JSON.stringify(data.liberationStatus));
            }

            // — Medals spent —
            if (data.medalsSpent != null) {
                localStorage.setItem("medalsSpent", JSON.stringify(data.medalsSpent));
            }

            // — Theme —
            if (data.theme && window.applyTheme) applyTheme(data.theme);

            // — Show Title —
            if (data.showTitle != null) localStorage.setItem("showTitle", data.showTitle);

            // — Short Titles —
            if (data.showShortTitle != null) {
                localStorage.setItem("showShortTitle", data.showShortTitle);
                shortTitleToggle.checked = data.showShortTitle === "true";
            }

            // — Show Medals —
            if (data.showMedals != null) {
                localStorage.setItem("showMedals", data.showMedals);
            }

            // — Card size —
            if (data.cardSize != null) localStorage.setItem("cardSize", data.cardSize);

            // — View Mode —
            if (data.view != null) localStorage.setItem("view", data.view);

            // — Sort —
            if (data.sort != null) localStorage.setItem("sort", data.sort);

            // — Type filter —
            if (data.typeFilter != null) {
                localStorage.setItem("typeFilter", JSON.stringify(data.typeFilter));
            }

            // — Lib filter —
            if (data.libFilter != null) {
                localStorage.setItem("libFilter", JSON.stringify(data.libFilter));
            }

            // — CRT —
            if (data.crt != null) {
                localStorage.setItem("crt", data.crt);
                if (window.setCrt) setCrt(data.crt !== "0");
                crtToggle.checked = data.crt !== "0";
            }

            // — OLED —
            if (data.oled != null) {
                localStorage.setItem("oled", data.oled);
                if (window.setOled) setOled(data.oled === "1");
                oledToggle.checked = data.oled === "1";
            }

            // — Backdrop —
            if (data.backdrop != null) {
                localStorage.setItem("backdrop", data.backdrop);
                if (window.setBackdrop) setBackdrop(data.backdrop === "1");
                backdropToggle.checked = data.backdrop === "1";
            }

            // — Announcement seen —
            if (data.announcement_seen != null) {
                localStorage.setItem("announcement_seen", data.announcement_seen);
            }

            window.showNotice({ tag: "Wall of Martyrs", message: "Import successful." });
        } catch {
            window.showNotice({ tag: "Wall of Martyrs", message: "Invalid file.", label: "Dismiss" });
        }
    };
    reader.readAsText(file);
    importFile.value = "";
});

// --------------------------------------------------
// ENEMY ARTILLERY — clear buttons
// --------------------------------------------------

document.getElementById("clearLiberation").addEventListener("click", () => {
    window.showConfirm({
        tag:          "Enemy Artillery",
        message:      "Clear all liberation progress? This cannot be undone.",
        confirmLabel: "Clear",
        onConfirm:    () => {
            localStorage.removeItem("liberationStatus");
            localStorage.removeItem("medalsSpent");
        },
    });
});

document.getElementById("clearStorage").addEventListener("click", () => {
    window.showConfirm({
        tag:          "Enemy Artillery",
        message:      "Wipe ALL saved data? This cannot be undone.",
        confirmLabel: "Wipe",
        onConfirm: () => {
            localStorage.clear();
            if (window.applyTheme)   applyTheme("helldivers");
            if (window.setCrt)       setCrt(false);
            if (window.setOled)      setOled(false);
            if (window.setBackdrop)  setBackdrop(false);
            crtToggle.checked        = false;
            oledToggle.checked       = false;
            backdropToggle.checked   = false;
            shortTitleToggle.checked = false;
        },
    });
});

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
        const tr         = document.createElement("tr");
        const tdName     = document.createElement("td");
        tdName.textContent = w.title;
        const tdAliases  = document.createElement("td");
        tdAliases.textContent = (w.aliases || []).join(", ") || "—";
        tr.append(tdName, tdAliases);
        table.appendChild(tr);
    });

    window.showModal({ tag: "Intel", title: "Warbond Aliases", content: table });
});

// --------------------------------------------------
// INTEL — View Profile
// --------------------------------------------------

document.getElementById("viewProfile").addEventListener("click", async () => {
    let totalWarbonds = 0;
    try {
        const data = await fetch("./app/warbonds.json").then(r => r.json());
        totalWarbonds = data.length;
    } catch { /* unliberated will show as — */ }

    const liberation = JSON.parse(localStorage.getItem("liberationStatus") || "{}");
    const values     = Object.values(liberation);
    const liberated  = values.filter(s => s === "liberated").length;
    const liberating = values.filter(s => s === "liberating").length;
    const unliberated = totalWarbonds
        ? totalWarbonds - liberated - liberating
        : "—";

    const medalsData  = JSON.parse(localStorage.getItem("medalsSpent") || "{}");
    const medalsTotal = Object.values(medalsData).reduce((sum, v) => sum + v, 0);

    const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";

    function section(heading, rows) {
        const wrap = document.createElement("div");
        wrap.className = "profile-section";
        const h = document.createElement("div");
        h.className   = "profile-section-title";
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
        ["Liberated",   liberated],
        ["Liberating",  liberating],
        ["Unliberated", unliberated],
    ]));
    container.appendChild(section("Medals", [
        ["Total Spent", medalsTotal.toLocaleString()],
    ]));
    container.appendChild(section("Settings", [
        ["Theme",        cap(localStorage.getItem("theme") || "helldivers")],
        ["Show Title",   localStorage.getItem("showTitle")      === "true" ? "On" : "Off"],
        ["Short Titles", localStorage.getItem("showShortTitle") === "true" ? "On" : "Off"],
        ["Show Medals",  localStorage.getItem("showMedals")     === "true" ? "On" : "Off"],
        ["Card Size",    cap(localStorage.getItem("cardSize") || "medium")],
        ["CRT Effect",   localStorage.getItem("crt")      !== "0" ? "On" : "Off"],
        ["OLED",         localStorage.getItem("oled")     === "1" ? "On" : "Off"],
        ["Backdrop",     localStorage.getItem("backdrop") === "1" ? "On" : "Off"],
    ]));
    container.appendChild(section("Announcements", [
        ["Last Seen", localStorage.getItem("announcement_seen") || "—"],
    ]));

    window.showModal({ tag: "Intel", title: "Profile", content: container });
});

// --------------------------------------------------
// ABOUT — View Credits
// --------------------------------------------------

document.getElementById("viewCredits").addEventListener("click", async () => {
    let credits;
    try {
        credits = await fetch("./app/credits.json").then(r => r.json());
    } catch {
        window.showNotice({ tag: "About", message: "Could not load credits." });
        return;
    }

    const container = document.createElement("div");

    credits.forEach(entry => {
        const item = document.createElement("div");
        item.className = "credits-entry";

        const header = document.createElement("div");
        header.className = "credits-header";

        const title = document.createElement("a");
        title.className  = "credits-title";
        title.href       = entry.url;
        title.target     = "_blank";
        title.rel        = "noopener noreferrer";
        title.textContent = entry.title;

        const author = document.createElement("span");
        author.className  = "credits-author";
        author.textContent = entry.author;

        header.append(title, author);

        const uses = document.createElement("div");
        uses.className  = "credits-uses";
        uses.textContent = entry.uses.join(" · ");

        item.append(header, uses);
        container.appendChild(item);
    });

    window.showModal({ tag: "About", title: "Credits", content: container });
});

})();