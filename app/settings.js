(() => {

fetch("./app/meta.json")
    .then(r => r.json())
    .then(meta => {
        document.getElementById("meta-version").textContent = `v${meta.version} // ${meta.date}`;
        document.getElementById("meta-github").href = meta.github;
        document.getElementById("meta-changelog").href = meta.changelog;
        document.getElementById("meta-issues").href = meta.issues;
    });

document.getElementById("clearLiberation").addEventListener("click", () => {
    if (!confirm("Clear all liberation progress?\nAre you sure?")) return;
    localStorage.removeItem("liberationStatus");
});

document.getElementById("clearStorage").addEventListener("click", () => {
    if (!confirm("Wipe ALL saved data?\nAre you sure?")) return;
    localStorage.clear();
    if (window.applyTheme) applyTheme("default");
});

document.getElementById("exportData").addEventListener("click", () => {
    const data = {
        liberationStatus: JSON.parse(localStorage.getItem("liberationStatus") || "{}"),
        theme: localStorage.getItem("theme") || "default"
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
document.getElementById("importData").addEventListener("click", () => importFile.click());
importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            if (data.liberationStatus) localStorage.setItem("liberationStatus", JSON.stringify(data.liberationStatus));
            if (data.theme && window.applyTheme) applyTheme(data.theme);
            alert("Import successful.");
        } catch {
            alert("Invalid file.");
        }
    };
    reader.readAsText(file);
    importFile.value = "";
});

})();