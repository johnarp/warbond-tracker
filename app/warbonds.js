(() => {

let warbonds = [];
let liberationStatus = JSON.parse(localStorage.getItem("liberationStatus")) || {};

// --------------------------------------------------
// REFERENCES
// --------------------------------------------------
const grid        = document.getElementById("warbonds-grid");
const sortSelect  = document.getElementById("sortBy");
const toggleTitle = document.getElementById("toggleTitle");
const typeFilter  = document.getElementById("typeFilter");
const liberation  = document.getElementById("liberation");
const percentage  = document.getElementById("percentage");
const searchInput = document.getElementById("search");
const searchClear = document.getElementById("search-clear");

// --------------------------------------------------
// DATA
// --------------------------------------------------
fetch("./app/warbonds.json")
    .then(r => r.json())
    .then(data => {
        warbonds = data;
        render();
        searchInput?.focus();
    });

// --------------------------------------------------
// FILTER HELPERS
// --------------------------------------------------

// Returns the currently active filter value from a toggle group.
function activeValue(container) {
    return container.querySelector(".filter-btn.active")?.dataset.value ?? "all";
}

// Wires up click handlers for a filter toggle group.
function initToggles(container) {
    container.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            container.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            render();
        });
    });
}

// --------------------------------------------------
// CARD CREATION
// Extracted from render() to keep render() readable
// and to make each card's construction easy to follow.
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

    // Title overlaid on the image at bottom via CSS.
    // Use the short title if available and Short Titles is enabled.
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

    // Filter: Type
    const typeVal = activeValue(typeFilter);
    if (typeVal !== "all") {
        filtered = filtered.filter(w => w.type.toLowerCase() === typeVal);
    }

    // Filter: Liberation status
    const libVal = activeValue(liberation);
    if (libVal === "liberated") {
        filtered = filtered.filter(w => liberationStatus[w.title] === "liberated");
    } else if (libVal === "liberating") {
        filtered = filtered.filter(w => liberationStatus[w.title] === "liberating");
    } else if (libVal === "unliberated") {
        filtered = filtered.filter(w =>
            !liberationStatus[w.title] || liberationStatus[w.title] === "unliberated"
        );
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
    const [field, direction] = sortSelect.value.split("-");
    filtered.sort((a, b) => {
        const result = field === "release"
            ? new Date(a[field]) - new Date(b[field])
            : a[field].toLowerCase().localeCompare(b[field].toLowerCase());
        return direction === "asc" ? result : -result;
    });

    // Build and append cards
    const fragment = document.createDocumentFragment();
    filtered.forEach(item => fragment.appendChild(createCard(item)));
    grid.appendChild(fragment);

    updatePercentage();
}

// --------------------------------------------------
// STATUS MENU
// --------------------------------------------------
function closeStatusMenu(menu) {
    menu.remove();
}

function showStatusMenu(event, itemTitle, cardElement) {
    // If a menu is already open, close it and return
    const existing = document.querySelector(".status-menu");
    if (existing) { closeStatusMenu(existing); return; }

    const currentStatus = liberationStatus[itemTitle] || "unliberated";

    const menu = document.createElement("div");
    menu.className = "status-menu";

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
            closeStatusMenu(menu);
            render();
        });

        menu.appendChild(btn);
    });

    // Center the menu over the card
    const rect = cardElement.getBoundingClientRect();
    menu.style.cssText = `position:fixed; left:${rect.left + rect.width / 2}px; top:${rect.top + rect.height / 2}px; transform:translate(-50%,-50%)`;

    document.body.appendChild(menu);

    // Close when clicking outside
    setTimeout(() => {
        document.addEventListener("click", function dismiss(e) {
            if (!menu.contains(e.target)) {
                closeStatusMenu(menu);
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

    document.title = `${pct}% Liberated // Warbond Tracker`;
}

// --------------------------------------------------
// CARD SIZE
// Separated into two functions: applyCardSize (DOM only,
// used on restore) and saveCardSize (DOM + localStorage,
// used on user interaction) to avoid writing localStorage
// on every page load.
// --------------------------------------------------
function applyCardSize(size) {
    grid.classList.remove("grid-small", "grid-medium", "grid-large");
    grid.classList.add(`grid-${size}`);
}

const sizeGroup = document.getElementById("cardSize");
const savedSize = localStorage.getItem("cardSize") || "medium";

sizeGroup.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.value === savedSize);
    btn.addEventListener("click", () => {
        sizeGroup.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        applyCardSize(btn.dataset.value);
        localStorage.setItem("cardSize", btn.dataset.value);
    });
});

applyCardSize(savedSize);

// --------------------------------------------------
// LISTENERS
// --------------------------------------------------
initToggles(typeFilter);
initToggles(liberation);

sortSelect.addEventListener("change", render);

// Restore showTitle from localStorage
toggleTitle.checked = localStorage.getItem("showTitle") === "true";

toggleTitle.addEventListener("change", () => {
    localStorage.setItem("showTitle", toggleTitle.checked);
    document.querySelectorAll(".title").forEach(t =>
        t.classList.toggle("hidden", !toggleTitle.checked)
    );
});

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
// KEYBOARD SHORTCUT — press / to focus the search bar
// Ignores the keypress if a modifier key is held
// (keeping Ctrl free for the future stratagem input).
// Self-removes once the search element leaves the DOM.
// --------------------------------------------------
document.addEventListener("keydown", function focusSearch(e) {
    if (e.key !== "/") return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Remove self if this view is no longer active
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