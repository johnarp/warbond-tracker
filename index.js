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
        filtered = filtered.filter(w => liberationStatus[w.title] === "liberated");
    } 
    else if (liberation.value === "unliberated") {
        filtered = filtered.filter(w => !liberationStatus[w.title] || liberationStatus[w.title] === "unliberated");
    }
    else if (liberation.value === "liberating") {
        filtered = filtered.filter(w => liberationStatus[w.title] === "liberating")
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
            title.style.display = "none";
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

function showStatusMenu(event, itemTitle, cardElement) {
    // remove any existing menus
    const existingMenu = document.querySelector('.status-menu');
    if (existingMenu) {
        existingMenu.remove();
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
            menu.remove();
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
                menu.remove();
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
        `${liberatedCount}/${total} Liberated — ${percentValue}% | ${liberatingCount} In Progress`;
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
