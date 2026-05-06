(() => {

let warbonds = [];
let liberationStatus = JSON.parse(localStorage.getItem("liberationStatus")) || {};
let medalsSpent      = JSON.parse(localStorage.getItem("medalsSpent"))      || {};

// --------------------------------------------------
// CONTROL STATE
// typeActive and libActive are Sets — empty means "all".
// Persisted to localStorage as JSON arrays.
// sortValue and sizeValue are always a single string.
// --------------------------------------------------
let sortValue  = localStorage.getItem("sort")     || "release-desc";
let sizeValue  = localStorage.getItem("cardSize") || "medium";
let typeActive = new Set(JSON.parse(localStorage.getItem("typeFilter") || "[]"));
let libActive  = new Set(JSON.parse(localStorage.getItem("libFilter")  || "[]"));

// --------------------------------------------------
// REFERENCES
// --------------------------------------------------
const grid         = document.getElementById("warbonds-grid");
const toggleTitle  = document.getElementById("toggleTitle");
const toggleMedals = document.getElementById("toggleMedals");
const percentage   = document.getElementById("percentage");
const searchInput  = document.getElementById("search");
const searchClear  = document.getElementById("search-clear");

const sortBtn = document.getElementById("sortBtn");
const typeBtn = document.getElementById("typeBtn");
const libBtn  = document.getElementById("libBtn");
const sizeBtn = document.getElementById("sizeBtn");

// Reflect persisted filter-active state on buttons immediately
typeBtn.classList.toggle("active", typeActive.size > 0);
libBtn.classList.toggle("active",  libActive.size  > 0);

// --------------------------------------------------
// POPUP OPTIONS
// --------------------------------------------------
const SORT_OPTIONS = [
    { value: "release-desc", label: "Newest First"      },
    { value: "release-asc",  label: "Oldest First"      },
    { value: "title-asc",    label: "Title (A-Z)"       },
    { value: "title-desc",   label: "Title (Z-A)"       },
    { value: "type-asc",     label: "Type (A-Z)"        },
    { value: "type-desc",    label: "Type (Z-A)"        },
    { value: "medals-asc",   label: "Fewest Left"       },
    { value: "medals-desc",  label: "Most Left"         },
];

const TYPE_OPTIONS = [
    { value: "standard",  label: "Standard"  },
    { value: "premium",   label: "Premium"   },
    { value: "legendary", label: "Legendary" },
];

const LIB_OPTIONS = [
    { value: "liberated",   label: "Liberated"   },
    { value: "liberating",  label: "Liberating"  },
    { value: "unliberated", label: "Unliberated" },
];

const SIZE_OPTIONS = [
    { value: "small",  label: "Small"  },
    { value: "medium", label: "Medium" },
    { value: "large",  label: "Large"  },
];

// --------------------------------------------------
// DATA
// --------------------------------------------------
fetch("./app/warbonds.json")
    .then(r => r.json())
    .then(data => {
        warbonds = data;
        applyCardSize(sizeValue);
        render();
        searchInput?.focus();
    });

// --------------------------------------------------
// GENERIC CONTROL POPUP
// --------------------------------------------------
function showControlPopup({ anchor, options, multiSelect, isActive, onPick }) {
    const existing = document.querySelector(".status-menu[data-ctrl]");
    if (existing) {
        const wasThis = existing.dataset.ctrl === anchor.id;
        existing.remove();
        if (wasThis) return;
    }

    const menu = document.createElement("div");
    menu.className    = "status-menu";
    menu.dataset.ctrl = anchor.id;

    options.forEach(({ value, label }) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.className   = `status-option${isActive(value) ? " active" : ""}`;

        btn.addEventListener("click", e => {
            e.stopPropagation();
            onPick(value);
            if (multiSelect) {
                btn.className = `status-option${isActive(value) ? " active" : ""}`;
            } else {
                menu.remove();
            }
        });

        menu.appendChild(btn);
    });

    document.body.appendChild(menu);

    const ar = anchor.getBoundingClientRect();
    const mr = menu.getBoundingClientRect();
    let left = ar.left + ar.width / 2 - mr.width / 2;
    let top  = ar.bottom + 6;

    if (top + mr.height > window.innerHeight - 8) {
        top = ar.top - mr.height - 6;
    }

    left = Math.max(8, Math.min(left, window.innerWidth - mr.width - 8));

    menu.style.left = `${left}px`;
    menu.style.top  = `${top}px`;

    setTimeout(() => {
        document.addEventListener("click", function dismiss(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener("click", dismiss);
            }
        });
    }, 0);
}

// --------------------------------------------------
// CONTROL BUTTON WIRING
// --------------------------------------------------

sortBtn.addEventListener("click", () => {
    showControlPopup({
        anchor:      sortBtn,
        options:     SORT_OPTIONS,
        multiSelect: false,
        isActive:    v => v === sortValue,
        onPick: v => {
            sortValue = v;
            localStorage.setItem("sort", v);
            render();
        },
    });
});

typeBtn.addEventListener("click", () => {
    showControlPopup({
        anchor:      typeBtn,
        options:     TYPE_OPTIONS,
        multiSelect: true,
        isActive:    v => typeActive.has(v),
        onPick: v => {
            typeActive.has(v) ? typeActive.delete(v) : typeActive.add(v);
            typeBtn.classList.toggle("active", typeActive.size > 0);
            localStorage.setItem("typeFilter", JSON.stringify([...typeActive]));
            render();
        },
    });
});

libBtn.addEventListener("click", () => {
    showControlPopup({
        anchor:      libBtn,
        options:     LIB_OPTIONS,
        multiSelect: true,
        isActive:    v => libActive.has(v),
        onPick: v => {
            libActive.has(v) ? libActive.delete(v) : libActive.add(v);
            libBtn.classList.toggle("active", libActive.size > 0);
            localStorage.setItem("libFilter", JSON.stringify([...libActive]));
            render();
        },
    });
});

sizeBtn.addEventListener("click", () => {
    showControlPopup({
        anchor:      sizeBtn,
        options:     SIZE_OPTIONS,
        multiSelect: false,
        isActive:    v => v === sizeValue,
        onPick: v => {
            sizeValue = v;
            applyCardSize(v);
            localStorage.setItem("cardSize", v);
        },
    });
});

// --------------------------------------------------
// CARD CREATION
// --------------------------------------------------
function createCard(item) {
    const status = liberationStatus[item.title];

    const card = document.createElement("div");
    card.className = `card${status ? ` ${status}` : ""}`;

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "image-wrapper";

    const img = document.createElement("img");
    img.src     = item.cover;
    img.alt     = item.title;
    img.loading = "lazy";

    const stamp = document.createElement("div");
    stamp.className   = "stamp";
    stamp.textContent = "LIBERATED";

    const showShort = localStorage.getItem("showShortTitle") === "true";
    const title = document.createElement("h3");
    title.className   = `title${toggleTitle.checked ? "" : " hidden"}`;
    title.textContent = (showShort && item.short) ? item.short : item.title;

    // Medal badge — only rendered when medals-aiu is defined on the item
    if (item["medals-aiu"] != null) {
        const badge = document.createElement("div");
        badge.className = "medal-badge";
        if (!toggleMedals.checked) badge.classList.add("hidden");

        const medalImg = document.createElement("img");
        medalImg.src       = "./assets/medal.png";
        medalImg.alt       = "Medals";
        medalImg.className = "medal-icon";

        const spent = medalsSpent[item.title] || 0;
        const badgeText = document.createElement("span");
        badgeText.textContent = `${spent}/${item["medals-aiu"]}`;

        badge.append(medalImg, badgeText);
        imageWrapper.append(img, stamp, badge, title);
    } else {
        imageWrapper.append(img, stamp, title);
    }

    card.appendChild(imageWrapper);
    card.addEventListener("click", () => showWarbondModal(item));

    return card;
}

// --------------------------------------------------
// WARBOND MODAL
// Replaces the old status-menu popup on card click.
// Shows status buttons and, if medals-aiu is defined,
// a medals-spent input below.
// --------------------------------------------------
function showWarbondModal(item) {
    // Close any open control popup first
    document.querySelector(".status-menu[data-ctrl]")?.remove();

    const container = document.createElement("div");
    container.className = "warbond-modal-content";

    // — Status section —
    const statusLabel = document.createElement("div");
    statusLabel.className   = "warbond-modal-section-label";
    statusLabel.textContent = "Status";
    container.appendChild(statusLabel);

    const statusRow = document.createElement("div");
    statusRow.className = "warbond-modal-status-row";

    const STATUS_OPTIONS = [
        { value: "unliberated", label: "Unliberated" },
        { value: "liberating",  label: "Liberating"  },
        { value: "liberated",   label: "Liberated"   },
    ];

    let currentStatus = liberationStatus[item.title] || "unliberated";
    const statusBtns = [];

    STATUS_OPTIONS.forEach(({ value, label }) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.className   = `status-option${currentStatus === value ? " active" : ""}`;

        btn.addEventListener("click", () => {
            if (value === "unliberated") {
                delete liberationStatus[item.title];
            } else {
                liberationStatus[item.title] = value;
            }
            currentStatus = value;
            localStorage.setItem("liberationStatus", JSON.stringify(liberationStatus));
            statusBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            render();
        });

        statusBtns.push(btn);
        statusRow.appendChild(btn);
    });

    container.appendChild(statusRow);

    // — Medals section (only when item has medals-aiu) —
    if (item["medals-aiu"] != null) {
        const medalsLabel = document.createElement("div");
        medalsLabel.className   = "warbond-modal-section-label";
        medalsLabel.textContent = "Medals Spent";
        container.appendChild(medalsLabel);

        const medalsRow = document.createElement("div");
        medalsRow.className = "warbond-modal-medals-row";

        const medalImg = document.createElement("img");
        medalImg.src       = "./assets/medal.png";
        medalImg.alt       = "Medals";
        medalImg.className = "medal-icon medal-icon-lg";

        const medalsInput = document.createElement("input");
        medalsInput.type        = "number";
        medalsInput.min         = "0";
        medalsInput.max         = String(item["medals-aiu"]);
        medalsInput.value       = String(medalsSpent[item.title] || 0);
        medalsInput.className   = "medals-input";
        medalsInput.placeholder = "0";

        const medalsSep = document.createElement("span");
        medalsSep.className   = "medals-sep";
        medalsSep.textContent = "/";

        const medalsTotal = document.createElement("span");
        medalsTotal.className   = "medals-total";
        medalsTotal.textContent = String(item["medals-aiu"]);

        function commitMedals() {
            const raw = parseInt(medalsInput.value, 10);
            const val = isNaN(raw) ? 0 : Math.max(0, Math.min(item["medals-aiu"], raw));
            medalsInput.value = String(val);
            if (val === 0) {
                delete medalsSpent[item.title];
            } else {
                medalsSpent[item.title] = val;
            }
            localStorage.setItem("medalsSpent", JSON.stringify(medalsSpent));
            render();
        }

        medalsInput.addEventListener("change", commitMedals);
        medalsInput.addEventListener("blur",   commitMedals);

        medalsRow.append(medalImg, medalsInput, medalsSep, medalsTotal);
        container.appendChild(medalsRow);
    }

    window.showModal({
        tag:     (item.short && localStorage.getItem("showShortTitle") === "true") ? item.short : item.title,
        content: container,
    });
}

// --------------------------------------------------
// RENDER
// --------------------------------------------------
function render() {
    grid.innerHTML = "";
    let filtered = [...warbonds];

    if (typeActive.size > 0) {
        filtered = filtered.filter(w => typeActive.has(w.type.toLowerCase()));
    }

    if (libActive.size > 0) {
        filtered = filtered.filter(w => {
            const s = liberationStatus[w.title] || "unliberated";
            return libActive.has(s);
        });
    }

    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        filtered = filtered.filter(w =>
            w.title.toLowerCase().includes(query) ||
            (w.aliases || []).some(a => a.toLowerCase().includes(query))
        );
    }

    // Sort
    const lastDash   = sortValue.lastIndexOf("-");
    const field      = sortValue.slice(0, lastDash);
    const direction  = sortValue.slice(lastDash + 1);

    filtered.sort((a, b) => {
        if (field === "medals") {
            // Items without medals-aiu always sort to the end
            const aiu = a["medals-aiu"];
            const biu = b["medals-aiu"];
            if (aiu == null && biu == null) return 0;
            if (aiu == null) return 1;
            if (biu == null) return -1;
            const aR = aiu - (medalsSpent[a.title] || 0);
            const bR = biu - (medalsSpent[b.title] || 0);
            return direction === "asc" ? aR - bR : bR - aR;
        }

        const result = field === "release"
            ? new Date(a[field]) - new Date(b[field])
            : a[field].toLowerCase().localeCompare(b[field].toLowerCase());
        return direction === "asc" ? result : -result;
    });

    if (filtered.length === 0) {
        const msg = document.createElement("div");
        msg.className = "no-results";
        msg.textContent = "Signal Lost...";
        grid.appendChild(msg);
    } else {
        const fragment = document.createDocumentFragment();
        filtered.forEach(item => fragment.appendChild(createCard(item)));
        grid.appendChild(fragment);
    }

    updatePercentage();
}

// --------------------------------------------------
// PERCENTAGE BAR
// --------------------------------------------------
function updatePercentage() {
    const total           = warbonds.length;
    const liberatedCount  = Object.values(liberationStatus).filter(s => s === "liberated").length;
    const liberatingCount = Object.values(liberationStatus).filter(s => s === "liberating").length;
    const pct             = total === 0 ? 0 : Math.round((liberatedCount / total) * 100);

    percentage.textContent =
        `${pct}% Liberated // ${liberatedCount} of ${total} Warbonds` +
        (liberatingCount > 0 ? ` // ${liberatingCount} Active ${liberatingCount === 1 ? "Front" : "Fronts"}` : "");

    document.title = `${pct}% // Warbond Tracker`;
}

// --------------------------------------------------
// CARD SIZE
// --------------------------------------------------
function applyCardSize(size) {
    grid.classList.remove("grid-small", "grid-medium", "grid-large");
    grid.classList.add(`grid-${size}`);
}

// --------------------------------------------------
// SHOW TITLE
// --------------------------------------------------
toggleTitle.checked = localStorage.getItem("showTitle") === "true";

toggleTitle.addEventListener("change", () => {
    localStorage.setItem("showTitle", toggleTitle.checked);
    document.querySelectorAll(".title").forEach(t =>
        t.classList.toggle("hidden", !toggleTitle.checked)
    );
});

// --------------------------------------------------
// SHOW MEDALS
// --------------------------------------------------
toggleMedals.checked = localStorage.getItem("showMedals") === "true";

toggleMedals.addEventListener("change", () => {
    localStorage.setItem("showMedals", String(toggleMedals.checked));
    document.querySelectorAll(".medal-badge").forEach(b =>
        b.classList.toggle("hidden", !toggleMedals.checked)
    );
});

// --------------------------------------------------
// SEARCH
// --------------------------------------------------
let searchDebounce;
searchInput.addEventListener("input", () => {
    searchClear.classList.toggle("visible", searchInput.value.length > 0);
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(render, 150);
});

searchClear.addEventListener("click", e => {
    e.stopPropagation();
    searchInput.value = "";
    searchClear.classList.remove("visible");
    searchInput.focus();
    render();
});

// --------------------------------------------------
// KEYBOARD SHORTCUT — / to focus search
// --------------------------------------------------
document.addEventListener("keydown", function focusSearch(e) {
    if (e.key !== "/") return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!document.getElementById("search")) {
        document.removeEventListener("keydown", focusSearch);
        return;
    }
    const active = document.activeElement;
    if (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT") return;
    e.preventDefault();
    searchInput.focus();
});

})();