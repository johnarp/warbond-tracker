const grid = document.getElementById("grid");
const sortSelect = document.getElementById("sortBy");
const toggleTitle = document.getElementById("toggleTitle");
const typeFilter = document.getElementById("typeFilter");
const liberation = document.getElementById("liberation");
const percentage = document.getElementById("percentage");
const clearLiberation = document.getElementById("clearLiberation");
const clearStorage = document.getElementById("clearStorage");
const searchInput = document.getElementById("search");
const searchClear = document.getElementById("search-clear");

let warbonds = [];
let liberationStatus = JSON.parse(localStorage.getItem("liberationStatus")) || {};

fetch("./app/data.json")
    .then(response => response.json())
    .then(data => {
        warbonds = data;
        render();
    });

function render() {
    grid.innerHTML = "";

    let filtered = [...warbonds];

    /* ------------------------
       FILTER BY TYPE
    ------------------------ */
    if (typeFilter.value !== "all") {
        filtered = filtered.filter(w =>
            w.type.toLowerCase() === typeFilter.value
        );
    }

    /* ------------------------
       FILTER BY LIBERATION
    ------------------------ */
    if (liberation.value === "liberated") {
        filtered = filtered.filter(w => liberationStatus[w.title] === "liberated");
    } 
    else if (liberation.value === "unliberated") {
        filtered = filtered.filter(w => !liberationStatus[w.title] || liberationStatus[w.title] === "unliberated");
    }
    else if (liberation.value === "liberating") {
        filtered = filtered.filter(w => liberationStatus[w.title] === "liberating")
    }

    /* ------------------------
       SEARCH
    ------------------------ */

    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        filtered = filtered.filter(w => {
            const titleMatch = w.title.toLowerCase().includes(query);
            const aliasMatch = (w.aliases || []).some(a => a.toLowerCase() === query);
            return titleMatch || aliasMatch;
        });
    }

    let searchDebounce;
    searchInput.addEventListener("input", () => {
        searchClear.classList.toggle("visible", searchInput.value.length > 0);
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(render, 150);
    });

    searchClear.addEventListener("click", (e) => {
        e.stopPropagation();
        searchInput.value = "";
        searchClear.classList.remove("visible");
        searchInput.focus();
        render();
    });

    /* ------------------------
       SORT
    ------------------------ */
    const [field, direction] = sortSelect.value.split("-");

    filtered.sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];

        // updated for release dates
        let result;
        if (field === "release") {
            result = new Date(valueA) - new Date(valueB);
        } else {
            result = valueA.toLowerCase().localeCompare(valueB.toLowerCase());
        }

        // valueA = valueA.toLowerCase();
        // valueB = valueB.toLowerCase();
        // let result = valueA.localeCompare(valueB);

        return direction === "asc" ? result : -result;
    });

    /* ------------------------
       RENDER CARDS
    ------------------------ */
    filtered.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");

        const status = liberationStatus[item.title];
        // if (liberationStatus[item.title]) {
        //     card.classList.add("liberated");
        // }
        if (status === "liberated") {
            card.classList.add("liberated");
        } else if (status === "liberating") {
            card.classList.add("liberating");
        }

        // IMAGE WRAPPER (important)
        const imageWrapper = document.createElement("div");
        imageWrapper.classList.add("image-wrapper");

        const img = document.createElement("img");
        img.src = item.cover;
        img.alt = item.title;

        const stamp = document.createElement("div");
        stamp.classList.add("stamp");
        stamp.textContent = "LIBERATED";

        imageWrapper.appendChild(img);
        imageWrapper.appendChild(stamp);

        const title = document.createElement("h3");
        title.textContent = item.title;
        title.classList.add("title");

        if (!toggleTitle.checked) {
            title.classList.add("hidden");
        }

        // card.addEventListener("click", () => {
        //     liberationStatus[item.title] = !liberationStatus[item.title];
        //     localStorage.setItem(
        //         "liberationStatus",
        //         JSON.stringify(liberationStatus)
        //     );
        //     render();
        // });
        card.addEventListener("click", (e) => {
            showStatusMenu(e, item.title, card);
        })

        card.appendChild(imageWrapper);
        card.appendChild(title);
        grid.appendChild(card);
    });

    updatePercentage();
}

/* ------------------------
   STATUS MENU
------------------------ */

function closeStatusMenu(menu) {
    menu.style.transform = '';  // let the keyframe take over
    menu.style.animation = 'menuFadeOut 0.15s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    menu.addEventListener('animationend', () => menu.remove(), { once: true });
}

function showStatusMenu(event, itemTitle, cardElement) {
    // remove any existing menus
    const existingMenu = document.querySelector('.status-menu');
    if (existingMenu) {
        closeStatusMenu(existingMenu);
        return;
    }

    const menu = document.createElement("div");
    menu.classList.add("status-menu");

    const currentStatus = liberationStatus[itemTitle] || "unliberated";

    const options = [
        { value: "unliberated", label: "Unliberated" },
        { value: "liberating", label: "Liberating" },
        { value: "liberated", label: "Liberated" }
    ];

    options.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option.label;
        button.classList.add("status-option");

        if (currentStatus === option.value) {
            button.classList.add("active");
        }

        button.addEventListener("click", (e) => {
            e.stopPropagation();

            if (option.value === "unliberated") {
                delete liberationStatus[itemTitle];
            } else {
                liberationStatus[itemTitle] = option.value;
            }

            localStorage.setItem("liberationStatus", JSON.stringify(liberationStatus));
            closeStatusMenu(menu);
            render();
        });
        menu.appendChild(button);
    });

    // position menu near card
    const rect = cardElement.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.left = `${rect.left + rect.width / 2}px`;
    menu.style.top = `${rect.top + rect.height / 2}px`;
    menu.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(menu);

    // close menu when click outside
    setTimeout(() => {
        document.addEventListener("click", function closeMenu(e) {
            if (!menu.contains(e.target)) {
                closeStatusMenu(menu);
                document.removeEventListener("click", closeMenu);
            }
        });
    }, 0);
}


/* ------------------------
   PERCENTAGE
------------------------ */
function updatePercentage() {
    const total = warbonds.length;
    const liberatedCount = Object.values(liberationStatus).filter(status => status === "liberated").length;
    const liberatingCount = Object.values(liberationStatus).filter(status => status === "liberating").length;
    const percentValue =
        total === 0 ? 0 : Math.round((liberatedCount / total) * 100);

    percentage.textContent =
        // `${liberatedCount}/${total} Liberated — ${percentValue}% | ${liberatingCount} In Progress`;
        // after the + is just logic so that ACTIVE FRONTS only shows if its >0
        `${percentValue}% LIBERATED // ${liberatedCount} OF ${total} WARBONDS` + 
        (liberatingCount > 0 ? ` // ${liberatingCount} ACTIVE ${liberatingCount === 1 ? "FRONT" : "FRONTS"}` : ``);

    document.title = `${percentValue}% Liberated // Warbond Tracker`;
}

/* ------------------------
   CLEAR LIBERATION ONLY
------------------------ */
clearLiberation.addEventListener("click", () => {
    const confirmed = confirm(
        "Clear all liberation progress?.\nAre you sure?"
    );
    if (!confirmed) return;
    liberationStatus = {};
    localStorage.removeItem("liberationStatus");
    render();
});

/* ------------------------
   CLEAR ALL STORAGE
------------------------ */
clearStorage.addEventListener("click", () => {
    const confirmed = confirm(
        "This will wipe ALL saved data and reset everything.\nAre you sure?"
    );

    if (!confirmed) return;

    localStorage.clear();
    liberationStatus = {};
    applyTheme("super-destroyer");
    render();
});

/* ------------------------
    SETTINGS
------------------------ */

const settingsCog = document.getElementById("settingsCog");
const settingsPanel = document.getElementById("settings-panel");

const controlsBar = document.getElementById("controls")

settingsCog.addEventListener("click", () => {
    const isOpen = settingsPanel.classList.toggle("open");
    settingsCog.classList.toggle("open", isOpen);
    controlsBar.classList.toggle("panel-open", isOpen);
});

/* ------------------------
   THEMES
------------------------ */

const savedTheme = localStorage.getItem("theme") || "super-destroyer";
applyTheme(savedTheme);

function applyTheme(theme) {
    if (theme === "super-destroyer") {
        document.documentElement.removeAttribute("data-theme");
    } else {
        document.documentElement.setAttribute("data-theme", theme);
    }

    document.querySelectorAll("#themeButtons button").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.theme === theme);
    });

    localStorage.setItem("theme", theme);

    const themeColors = {
        "super-destroyer": "#ffe710",
        "super-earth":     "#f0c020",
        "cyberstan":       "#e82020",
        "bile":            "#7dff00",
        "meridia":         "#9966ff",
        "redacted":        "#dddddd",
        "erata-prime":     "#c8922a",
    };
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", themeColors[theme] || "#ffe710");
}

document.getElementById("themeButtons").addEventListener("click", (e) => {
    if (e.target.matches("button")) {
        applyTheme(e.target.dataset.theme);
    }
});

/* ------------------------
   SEARCH
------------------------ */

/* ------------------------
   IMPORT / EXPORT
------------------------ */
document.getElementById("exportData").addEventListener("click", () => {
    const data = {
        liberationStatus,
        theme: localStorage.getItem("theme") || "super-destroyer"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "warbond-tracker.json";
    a.click();
    URL.revokeObjectURL(url);
});

const importFile = document.getElementById("importFile");

document.getElementById("importData").addEventListener("click", () => {
    importFile.click();
});

importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            if (data.liberationStatus) {
                liberationStatus = data.liberationStatus;
                localStorage.setItem("liberationStatus", JSON.stringify(liberationStatus));
            }
            if (data.theme) {
                applyTheme(data.theme);
            }
            render();
        } catch {
            alert("Invalid file. Make sure it's a Warbond Tracker export.");
        }
    };
    reader.readAsText(file);
    importFile.value = "";
});

/* ------------------------
   LISTENERS
------------------------ */
sortSelect.addEventListener("change", render);
toggleTitle.addEventListener("change", () => {
    document.querySelectorAll(".title").forEach(t => {
        t.classList.toggle("hidden", !toggleTitle.checked);
    });
});
typeFilter.addEventListener("change", render);
liberation.addEventListener("change", render);
