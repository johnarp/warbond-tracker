(() => {

let warbonds = [];
let liberationStatus = JSON.parse(localStorage.getItem("liberationStatus")) || {};

// --------------------------------------------------
// REFERENCES
// --------------------------------------------------

const grid = document.getElementById("warbonds-grid");
const sortSelect = document.getElementById("sortBy");
const toggleTitle = document.getElementById("toggleTitle");
const typeFilter = document.getElementById("typeFilter");
const liberation = document.getElementById("liberation");
const percentage = document.getElementById("percentage");
const searchInput = document.getElementById("search");
const searchClear = document.getElementById("search-clear");

// --------------------------------------------------
// JSON
// --------------------------------------------------

fetch("./app/warbonds.json")
    .then(r => r.json())
    .then(data => {
        warbonds = data;
        render();
    });

// --------------------------------------------------
// RENDER
// --------------------------------------------------

function render() {
    grid.innerHTML = "";
    let filtered = [...warbonds];

    // FILTER: Type
    if (typeFilter.value !== "all") {
        filtered = filtered.filter(w => 
            w.type.toLowerCase() === typeFilter.value
        );
    }

    // FILTER: Liberation
    const lib = liberation.value;
    if (lib === "liberated") {
        filtered = filtered.filter(w => liberationStatus[w.title] === "liberated");
    } else if (lib === "liberating") {
        filtered = filtered.filter(w => liberationStatus[w.title] === "liberating");
    } else if (lib === "unliberated") {
        filtered = filtered.filter(w => !liberationStatus[w.title] || liberationStatus[w.title] === "unliberated"
        );
    }

    // FILTER: Search
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        filtered = filtered.filter(w => {
            const titleMatch = w.title.toLowerCase().includes(query);
            const aliasMatch = (w.aliases || []).some(a => a.toLowerCase().includes(query));
            return titleMatch || aliasMatch;
        });
    }

    // SORT
    const [field, direction] = sortSelect.value.split("-");
    filtered.sort((a, b) => {
        const result = field === "release"
            ? new Date(a[field]) - new Date(b[field])
            : a[field].toLowerCase().localeCompare(b[field].toLowerCase());
        return direction === "asc" ? result : -result;
    });

    // RENDER
    filtered.forEach(item => {
        const status = liberationStatus[item.title];

        const card = document.createElement("div");
        card.classList.add("card");
        if (status === "liberated")  card.classList.add("liberated");
        if (status === "liberating") card.classList.add("liberating");

        const imageWrapper = document.createElement("div");
        imageWrapper.classList.add("image-wrapper");

        const img = document.createElement("img");
        img.src = item.cover;
        img.alt = item.title;
        img.loading = "lazy";

        const stamp = document.createElement("div");
        stamp.classList.add("stamp");
        stamp.textContent = "LIBERATED";

        imageWrapper.append(img, stamp);

        const title = document.createElement("h3");
        title.textContent = item.title;
        title.classList.add("title");
        if (!toggleTitle.checked) title.classList.add("hidden");

        card.addEventListener("click", e => showStatusMenu(e, item.title, card));
        card.append(imageWrapper, title);
        grid.appendChild(card);
    });

    updatePercentage();
}

// --------------------------------------------------
// STATUS
// --------------------------------------------------

function closeStatusMenu(menu) {
    menu.remove();
}

function showStatusMenu(event, itemTitle, cardElement) {
    const existing = document.querySelector(".status-menu");
    if (existing) { closeStatusMenu(existing); return; }

    const menu = document.createElement("div");
    menu.classList.add("status-menu");

    const currentStatus = liberationStatus[itemTitle] || "unliberated";

    const options = [
        { value: "unliberated", label: "Unliberated" },
        { value: "liberating",  label: "Liberating"  },
        { value: "liberated",   label: "Liberated"   },
    ];

    options.forEach(({ value, label }) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.classList.add("status-option");
        if (currentStatus === value) btn.classList.add("active");

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

    // Position centered on card
    const rect = cardElement.getBoundingClientRect();
    Object.assign(menu.style, {
        position:  "fixed",
        left:      `${rect.left + rect.width  / 2}px`,
        top:       `${rect.top  + rect.height / 2}px`,
        transform: "translate(-50%, -50%)",
    });

    document.body.appendChild(menu);

    // Dismiss on outside click — deferred so the opening click doesn't instantly close it
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
// PERCENTAGE
// --------------------------------------------------

function updatePercentage() {
    const total          = warbonds.length;
    const liberatedCount = Object.values(liberationStatus).filter(s => s === "liberated").length;
    const liberatingCount= Object.values(liberationStatus).filter(s => s === "liberating").length;
    const pct            = total === 0 ? 0 : Math.round((liberatedCount / total) * 100);

    percentage.textContent =
        `${pct}% LIBERATED // ${liberatedCount} OF ${total} WARBONDS` +
        (liberatingCount > 0 ? ` // ${liberatingCount} ACTIVE ${liberatingCount === 1 ? "FRONT" : "FRONTS"}` : "");

    document.title = `${pct}% Liberated // Warbond Tracker`;
}

// --------------------------------------------------
// LISTENERS
// --------------------------------------------------

sortSelect.addEventListener("change", render);
typeFilter.addEventListener("change", render);
liberation.addEventListener("change", render);

toggleTitle.addEventListener("change", () => {
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

})();