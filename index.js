const grid = document.getElementById("grid");
const sortSelect = document.getElementById("sortBy");
const toggleTitle = document.getElementById("toggleTitle");
const typeFilter = document.getElementById("typeFilter");
const liberation = document.getElementById("liberation");
const percentage = document.getElementById("percentage");
const clearLiberation = document.getElementById("clearLiberation");
const clearStorage = document.getElementById("clearStorage");

let warbonds = [];
let liberationStatus = JSON.parse(localStorage.getItem("liberationStatus")) || {};

fetch("./data.json")
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
        filtered = filtered.filter(w => liberationStatus[w.title]);
    } 
    else if (liberation.value === "unliberated") {
        filtered = filtered.filter(w => !liberationStatus[w.title]);
    }

    /* ------------------------
       SORT
    ------------------------ */
    const [field, direction] = sortSelect.value.split("-");

    filtered.sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];

        // normalize for type sorting (case safe)
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();

        let result = valueA.localeCompare(valueB);
        return direction === "asc" ? result : -result;
    });

    /* ------------------------
       RENDER CARDS
    ------------------------ */
    filtered.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");

        if (liberationStatus[item.title]) {
            card.classList.add("liberated");
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
            title.style.display = "none";
        }

        card.addEventListener("click", () => {
            liberationStatus[item.title] = !liberationStatus[item.title];
            localStorage.setItem(
                "liberationStatus",
                JSON.stringify(liberationStatus)
            );
            render();
        });

        card.appendChild(imageWrapper);
        card.appendChild(title);
        grid.appendChild(card);
    });

    updatePercentage();
}

/* ------------------------
   PERCENTAGE
------------------------ */
function updatePercentage() {
    const total = warbonds.length;
    const liberatedCount = Object.values(liberationStatus).filter(Boolean).length;
    const percentValue =
        total === 0 ? 0 : Math.round((liberatedCount / total) * 100);

    percentage.textContent =
        `${liberatedCount}/${total} — ${percentValue}%`;
}

/* ------------------------
   CLEAR LIBERATION ONLY
------------------------ */
clearLiberation.addEventListener("click", () => {
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
    render();
});


/* ------------------------
   LISTENERS
------------------------ */
sortSelect.addEventListener("change", render);
toggleTitle.addEventListener("change", render);
typeFilter.addEventListener("change", render);
liberation.addEventListener("change", render);
