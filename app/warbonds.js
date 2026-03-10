(() => {

let warbonds = [];
let liberationStatus = JSON.parse(localStorage.getItem("liberationStatus")) || {};

// --------------------------------------------------
// CONTROL STATE
// typeActive and libActive are Sets — empty means "all".
// sortValue and sizeValue are always a single string.
// --------------------------------------------------
let sortValue  = localStorage.getItem("sort")     || "release-desc";
let sizeValue  = localStorage.getItem("cardSize") || "medium";
let typeActive = new Set();
let libActive  = new Set();

// --------------------------------------------------
// REFERENCES
// --------------------------------------------------
const grid        = document.getElementById("warbonds-grid");
const toggleTitle = document.getElementById("toggleTitle");
const percentage  = document.getElementById("percentage");
const searchInput = document.getElementById("search");
const searchClear = document.getElementById("search-clear");

const sortBtn = document.getElementById("sortBtn");
const typeBtn = document.getElementById("typeBtn");
const libBtn  = document.getElementById("libBtn");
const sizeBtn = document.getElementById("sizeBtn");

// --------------------------------------------------
// POPUP OPTIONS
// --------------------------------------------------
const SORT_OPTIONS = [
    { value: "release-desc", label: "Newest First" },
    { value: "release-asc",  label: "Oldest First" },
    { value: "title-asc",    label: "Title (A-Z)"  },
    { value: "title-desc",   label: "Title (Z-A)"  },
    { value: "type-asc",     label: "Type (A-Z)"   },
    { value: "type-desc",    label: "Type (Z-A)"   },
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
// Shared by Sort, Type, Status, and Size buttons.
//
// Single-select (multiSelect: false):
//   Closes automatically after the user picks an option.
//
// Multi-select (multiSelect: true):
//   Stays open so the user can toggle multiple options.
//   Closes only when clicking outside.
//
// Clicking the same anchor button while its popup is
// already open will toggle (close) the popup.
//
// Positions itself below the anchor, flips above if
// it would overflow the bottom of the viewport.
// --------------------------------------------------
function showControlPopup({ anchor, options, multiSelect, isActive, onPick }) {
    // Close any open control popup; if it belongs to this anchor, just toggle closed
    const existing = document.querySelector(".status-menu[data-ctrl]");
    if (existing) {
        const wasThis = existing.dataset.ctrl === anchor.id;
        existing.remove();
        if (wasThis) return;
    }

    const menu = document.createElement("div");
    menu.className    = "status-menu";
    menu.dataset.ctrl = anchor.id; // distinguishes this from the card status menu

    options.forEach(({ value, label }) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.className   = `status-option${isActive(value) ? " active" : ""}`;

        btn.addEventListener("click", e => {
            e.stopPropagation();
            onPick(value);
            if (multiSelect) {
                // Reflect toggled state in place — keep the popup open
                btn.className = `status-option${isActive(value) ? " active" : ""}`;
            } else {
                menu.remove();
            }
        });

        menu.appendChild(btn);
    });

    // Append first so we can measure real dimensions for positioning
    document.body.appendChild(menu);

    const ar = anchor.getBoundingClientRect();
    const mr = menu.getBoundingClientRect();
    let left = ar.left + ar.width / 2 - mr.width / 2;
    let top  = ar.bottom + 6;

    // Flip above the anchor if the popup would overflow the bottom of the viewport
    if (top + mr.height > window.innerHeight - 8) {
        top = ar.top - mr.height - 6;
    }

    // Clamp horizontally so the popup stays inside the viewport
    left = Math.max(8, Math.min(left, window.innerWidth - mr.width - 8));

    menu.style.left = `${left}px`;
    menu.style.top  = `${top}px`;

    // Close when clicking outside
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

// Sort — single-select, persisted
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

// Type — multi-select; button highlights when any filter is active
typeBtn.addEventListener("click", () => {
    showControlPopup({
        anchor:      typeBtn,
        options:     TYPE_OPTIONS,
        multiSelect: true,
        isActive:    v => typeActive.has(v),
        onPick: v => {
            typeActive.has(v) ? typeActive.delete(v) : typeActive.add(v);
            typeBtn.classList.toggle("active", typeActive.size > 0);
            render();
        },
    });
});

// Status — multi-select; button highlights when any filter is active
libBtn.addEventListener("click", () => {
    showControlPopup({
        anchor:      libBtn,
        options:     LIB_OPTIONS,
        multiSelect: true,
        isActive:    v => libActive.has(v),
        onPick: v => {
            libActive.has(v) ? libActive.delete(v) : libActive.add(v);
            libBtn.classList.toggle("active", libActive.size > 0);
            render();
        },
    });
});

// Size — single-select, persisted
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

    // Use short title if available and Short Titles is enabled in Settings
    const showShort = localStorage.getItem("showShortTitle") === "true";
    const title = document.createElement("h3");
    title.className   = `title${toggleTitle.checked ? "" : " hidden"}`;
    title.textContent = (showShort && item.short) ? item.short : item.title;

    imageWrapper.append(img, stamp, title);
    card.appendChild(imageWrapper);
    card.addEventListener("click", e => showStatusMenu(e, item.title, card));

    return card;
}

// --------------------------------------------------
// RENDER
// --------------------------------------------------
function render() {
    grid.innerHTML = "";
    let filtered = [...warbonds];

    // Filter: Type — OR logic, empty Set = show all
    if (typeActive.size > 0) {
        filtered = filtered.filter(w => typeActive.has(w.type.toLowerCase()));
    }

    // Filter: Liberation — OR logic, empty Set = show all
    if (libActive.size > 0) {
        filtered = filtered.filter(w => {
            const s = liberationStatus[w.title] || "unliberated";
            return libActive.has(s);
        });
    }

    // Filter: Search
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        filtered = filtered.filter(w =>
            w.title.toLowerCase().includes(query) ||
            (w.aliases || []).some(a => a.toLowerCase().includes(query))
        );
    }

    // Sort
    const [field, direction] = sortValue.split("-");
    filtered.sort((a, b) => {
        const result = field === "release"
            ? new Date(a[field]) - new Date(b[field])
            : a[field].toLowerCase().localeCompare(b[field].toLowerCase());
        return direction === "asc" ? result : -result;
    });

    const fragment = document.createDocumentFragment();
    filtered.forEach(item => fragment.appendChild(createCard(item)));
    grid.appendChild(fragment);

    updatePercentage();
}

// --------------------------------------------------
// CARD STATUS MENU
// Separate from the control popup — positions itself
// centered over the card rather than below a button.
// --------------------------------------------------
function showStatusMenu(event, itemTitle, cardElement) {
    // Close any open popup (control or card) on first click; require a second click to open
    const existing = document.querySelector(".status-menu");
    if (existing) { existing.remove(); return; }

    const currentStatus = liberationStatus[itemTitle] || "unliberated";

    const menu = document.createElement("div");
    menu.className = "status-menu"; // no data-ctrl — identifies this as a card menu

    const options = [
        { value: "unliberated", label: "Unliberated" },
        { value: "liberating",  label: "Liberating"  },
        { value: "liberated",   label: "Liberated"   },
    ];

    options.forEach(({ value, label }) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.className   = `status-option${currentStatus === value ? " active" : ""}`;

        btn.addEventListener("click", e => {
            e.stopPropagation();
            if (value === "unliberated") {
                delete liberationStatus[itemTitle];
            } else {
                liberationStatus[itemTitle] = value;
            }
            localStorage.setItem("liberationStatus", JSON.stringify(liberationStatus));
            menu.remove();
            render();
        });

        menu.appendChild(btn);
    });

    // Centered over the card
    const rect = cardElement.getBoundingClientRect();
    menu.style.cssText = `position:fixed; left:${rect.left + rect.width / 2}px; top:${rect.top + rect.height / 2}px; transform:translate(-50%,-50%)`;

    document.body.appendChild(menu);

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
// Ctrl is intentionally excluded for future stratagem input.
// Self-removes if this view is unloaded.
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